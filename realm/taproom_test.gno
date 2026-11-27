package taproom

import (
	"chain"
	"chain/banker"
	"strings"
	"testing"
	"time"

	"gno.land/p/nt/avl/v0"
	"gno.land/p/nt/testutils/v0"
	"gno.land/p/nt/uassert/v0"
)

const pkgPath = "gno.land/r/dev/taproom"

var (
	alice = testutils.TestAddress("alice") // poster
	bob   = testutils.TestAddress("bob")   // hunter
	carol = testutils.TestAddress("carol") // hunter
)

func reset() {
	quests = avl.Tree{}
	people = avl.Tree{}
	nextID = 0
	totalEscrow = 0
	totalPaid = 0
}

func balance(a address) int64 {
	return banker.NewReadonlyBanker().GetCoin(a, "ugnot")
}

// issue credits the realm like the chain does when a tx carries -send.
// SetRealm/SetOriginSend must be called inline in the test body: they act on
// the calling frame and are lost when a helper returns.
func issue(reward int64) {
	testing.IssueCoins(chain.PackageAddress(pkgPath), chain.Coins{{"ugnot", reward}})
}

const (
	qTitle   = "Translate the docs"
	qDetails = "Translate the getting started page into Bahasa Indonesia."
)

func TestPostQuest(cur realm, t *testing.T) {
	defer reset()
	issue(5_000_000)
	testing.SetRealm(testing.NewUserRealm(alice))
	testing.SetOriginSend(chain.Coins{{"ugnot", 5_000_000}})
	id := PostQuest(cross(cur), qTitle, qDetails, 7)
	uassert.Equal(t, 1, id)
	uassert.Equal(t, int64(5_000_000), TotalEscrow())
	uassert.Equal(t, "open", StatusOf(id))
	uassert.Equal(t, 0, SubmissionCount(id))
	uassert.Equal(t, 1, Count())

	out := Render("")
	uassert.True(t, strings.Contains(out, "Translate the docs"), "board lists the quest")
	uassert.True(t, strings.Contains(out, "5 GNOT"), "board shows the reward")
	uassert.True(t, strings.Contains(Render("quest/1"), "Translate the getting started page"), "detail page")
}

func TestPostQuestValidation(cur realm, t *testing.T) {
	defer reset()
	realmAddr := chain.PackageAddress(pkgPath)
	testing.IssueCoins(realmAddr, chain.Coins{{"ugnot", 100_000_000}})
	testing.SetRealm(testing.NewUserRealm(alice))

	testing.SetOriginSend(chain.Coins{{"ugnot", MinReward - 1}})
	uassert.AbortsWithMessage(t, cur, "reward must be at least 1 GNOT", func() { PostQuest(cross(cur), "t", "d", 3) })

	testing.SetOriginSend(nil)
	uassert.AbortsWithMessage(t, cur, "send exactly one coin type: ugnot", func() { PostQuest(cross(cur), "t", "d", 3) })

	testing.SetOriginSend(chain.Coins{{"ugnot", MinReward}, {"foo", 5}})
	uassert.AbortsWithMessage(t, cur, "send exactly one coin type: ugnot", func() { PostQuest(cross(cur), "t", "d", 3) })

	testing.SetOriginSend(chain.Coins{{"foo", 5_000_000}})
	uassert.AbortsWithMessage(t, cur, "send exactly one coin type: ugnot", func() { PostQuest(cross(cur), "t", "d", 3) })

	testing.SetOriginSend(chain.Coins{{"ugnot", MinReward}})
	uassert.AbortsWithMessage(t, cur, "title must be 1-80 bytes", func() { PostQuest(cross(cur), "  ", "d", 3) })
	uassert.AbortsWithMessage(t, cur, "title must be 1-80 bytes", func() { PostQuest(cross(cur), strings.Repeat("x", 81), "d", 3) })
	uassert.AbortsWithMessage(t, cur, "details must be 1-600 bytes", func() { PostQuest(cross(cur), "t", "", 3) })
	uassert.AbortsWithMessage(t, cur, "days must be between 1 and 60", func() { PostQuest(cross(cur), "t", "d", 0) })
	uassert.AbortsWithMessage(t, cur, "days must be between 1 and 60", func() { PostQuest(cross(cur), "t", "d", 61) })

	uassert.Equal(t, 0, Count())
	uassert.Equal(t, int64(0), TotalEscrow())
}

func TestSubmitRules(cur realm, t *testing.T) {
	defer reset()
	issue(2_000_000)
	testing.SetRealm(testing.NewUserRealm(alice))
	testing.SetOriginSend(chain.Coins{{"ugnot", 2_000_000}})
	id := PostQuest(cross(cur), qTitle, qDetails, 5)

	testing.SetRealm(testing.NewUserRealm(alice))
	uassert.AbortsWithMessage(t, cur, "poster cannot answer their own quest", func() { Submit(cross(cur), id, "mine", "") })

	testing.SetRealm(testing.NewUserRealm(bob))
	uassert.AbortsWithMessage(t, cur, "note must be 1-400 bytes", func() { Submit(cross(cur), id, " ", "") })
	uassert.AbortsWithMessage(t, cur, "link must be a plain https:// URL", func() { Submit(cross(cur), id, "n", "http://x.io") })
	uassert.AbortsWithMessage(t, cur, "link must be a plain https:// URL", func() { Submit(cross(cur), id, "n", "https://x.io/a)[b](javascript:1") })
	uassert.AbortsWithMessage(t, cur, "no such quest: 99", func() { Submit(cross(cur), 99, "n", "") })

	Submit(cross(cur), id, "Done, see the PR", "https://github.com/example/pr/1")
	uassert.Equal(t, 1, SubmissionCount(id))
	uassert.AbortsWithMessage(t, cur, "you already submitted to this quest", func() { Submit(cross(cur), id, "again", "") })

	testing.SetRealm(testing.NewUserRealm(carol))
	Submit(cross(cur), id, "Mine is better", "")
	uassert.Equal(t, 2, SubmissionCount(id))

	// after the deadline nobody can submit
	q := mustQuest(id)
	q.deadline = time.Now().Add(-time.Minute)
	testing.SetRealm(testing.NewUserRealm(testutils.TestAddress("dave")))
	uassert.AbortsWithMessage(t, cur, "submission window has closed", func() { Submit(cross(cur), id, "late", "") })
}

func TestAwardPaysWinnerOnce(cur realm, t *testing.T) {
	defer reset()
	issue(3_500_000)
	testing.SetRealm(testing.NewUserRealm(alice))
	testing.SetOriginSend(chain.Coins{{"ugnot", 3_500_000}})
	id := PostQuest(cross(cur), qTitle, qDetails, 5)
	realmAddr := chain.PackageAddress(pkgPath)

	testing.SetRealm(testing.NewUserRealm(bob))
	Submit(cross(cur), id, "Here you go", "")

	// only the poster, only a submitter
	testing.SetRealm(testing.NewUserRealm(bob))
	uassert.AbortsWithMessage(t, cur, "only the poster can award this quest", func() { Award(cross(cur), id, bob) })
	testing.SetRealm(testing.NewUserRealm(alice))
	uassert.AbortsWithMessage(t, cur, "that address has not submitted", func() { Award(cross(cur), id, carol) })

	before := balance(bob)
	Award(cross(cur), id, bob)
	uassert.Equal(t, int64(3_500_000), balance(bob)-before)
	uassert.Equal(t, int64(0), balance(realmAddr))
	uassert.Equal(t, int64(0), TotalEscrow())
	uassert.Equal(t, int64(3_500_000), TotalPaid())
	uassert.Equal(t, "awarded", StatusOf(id))

	// no double pay, no reclaim after award
	uassert.AbortsWithMessage(t, cur, "quest is not open", func() { Award(cross(cur), id, bob) })
	uassert.AbortsWithMessage(t, cur, "quest is not open", func() { Reclaim(cross(cur), id) })
	testing.SetRealm(testing.NewUserRealm(carol))
	uassert.AbortsWithMessage(t, cur, "quest is not open", func() { Submit(cross(cur), id, "late", "") })

	// reputation
	out := Render("hunter/" + bob.String())
	uassert.True(t, strings.Contains(out, "3.5 GNOT"), "hunter earned shown")
	uassert.True(t, strings.Contains(Render(""), "won by"), "board shows the settled quest")
	uassert.True(t, strings.Contains(Render("quest/1"), "**Winner:**"), "detail page shows the winner")
}

func TestReclaimNoSubmissions(cur realm, t *testing.T) {
	defer reset()
	issue(1_000_000)
	testing.SetRealm(testing.NewUserRealm(alice))
	testing.SetOriginSend(chain.Coins{{"ugnot", 1_000_000}})
	id := PostQuest(cross(cur), qTitle, qDetails, 3)
	realmAddr := chain.PackageAddress(pkgPath)

	testing.SetRealm(testing.NewUserRealm(bob))
	uassert.AbortsWithMessage(t, cur, "only the poster can reclaim this quest", func() { Reclaim(cross(cur), id) })

	testing.SetRealm(testing.NewUserRealm(alice))
	before := balance(alice)
	Reclaim(cross(cur), id)
	uassert.Equal(t, int64(1_000_000), balance(alice)-before)
	uassert.Equal(t, int64(0), balance(realmAddr))
	uassert.Equal(t, int64(0), TotalEscrow())
	uassert.Equal(t, "reclaimed", StatusOf(id))
	uassert.AbortsWithMessage(t, cur, "quest is not open", func() { Reclaim(cross(cur), id) })
}

func TestReclaimBlockedWhileHuntersWait(cur realm, t *testing.T) {
	defer reset()
	issue(4_000_000)
	testing.SetRealm(testing.NewUserRealm(alice))
	testing.SetOriginSend(chain.Coins{{"ugnot", 4_000_000}})
	id := PostQuest(cross(cur), qTitle, qDetails, 3)
	testing.SetRealm(testing.NewUserRealm(bob))
	Submit(cross(cur), id, "delivered", "")

	testing.SetRealm(testing.NewUserRealm(alice))
	uassert.AbortsWithMessage(t, cur, "hunters have submitted: wait until the review window ends", func() { Reclaim(cross(cur), id) })

	// deadline passed but the review window is still running
	q := mustQuest(id)
	q.deadline = time.Now().Add(-24 * time.Hour)
	uassert.AbortsWithMessage(t, cur, "hunters have submitted: wait until the review window ends", func() { Reclaim(cross(cur), id) })

	// once the window is over the poster may reclaim
	q.deadline = time.Now().Add(-ReviewGrace - time.Hour)
	before := balance(alice)
	Reclaim(cross(cur), id)
	uassert.Equal(t, int64(4_000_000), balance(alice)-before)
}

func TestEscrowSeparatedBetweenQuests(cur realm, t *testing.T) {
	defer reset()
	issue(2_000_000)
	testing.SetRealm(testing.NewUserRealm(alice))
	testing.SetOriginSend(chain.Coins{{"ugnot", 2_000_000}})
	a := PostQuest(cross(cur), qTitle, qDetails, 5)
	issue(3_000_000)
	testing.SetRealm(testing.NewUserRealm(carol))
	testing.SetOriginSend(chain.Coins{{"ugnot", 3_000_000}})
	b := PostQuest(cross(cur), qTitle, qDetails, 5)
	uassert.Equal(t, int64(5_000_000), TotalEscrow())

	testing.SetRealm(testing.NewUserRealm(bob))
	Submit(cross(cur), a, "x", "")
	testing.SetRealm(testing.NewUserRealm(alice))
	Award(cross(cur), a, bob)
	uassert.Equal(t, int64(3_000_000), TotalEscrow())
	uassert.Equal(t, int64(3_000_000), balance(chain.PackageAddress(pkgPath)))

	testing.SetRealm(testing.NewUserRealm(carol))
	Reclaim(cross(cur), b)
	uassert.Equal(t, int64(0), TotalEscrow())
	uassert.Equal(t, int64(0), balance(chain.PackageAddress(pkgPath)))
}

func TestRenderEscapesUserText(cur realm, t *testing.T) {
	defer reset()
	realmAddr := chain.PackageAddress(pkgPath)
	testing.IssueCoins(realmAddr, chain.Coins{{"ugnot", MinReward}})
	testing.SetRealm(testing.NewUserRealm(alice))
	testing.SetOriginSend(chain.Coins{{"ugnot", MinReward}})
	id := PostQuest(cross(cur), "[click](https://evil.example)|<b>", "line1\n# Heading\n<script>alert(1)</script>", 2)

	title := Render("")
	uassert.False(t, strings.Contains(title, "[click](https://evil"), "title cannot inject a link")
	uassert.False(t, strings.Contains(title, "<b>"), "title cannot inject html")

	page := Render("quest/" + strconvItoa(id))
	uassert.False(t, strings.Contains(page, "<script>"), "details cannot inject html")
	uassert.False(t, strings.Contains(page, "\n# Heading"), "details cannot start a heading")
}

func TestRenderRoutes(cur realm, t *testing.T) {
	defer reset()
	uassert.True(t, strings.Contains(Render(""), "The board is empty"), "empty board")
	uassert.True(t, strings.Contains(Render("about"), "How Taproom works"), "about")
	uassert.True(t, strings.Contains(Render("quest/1"), "Not found"), "missing quest")
	uassert.True(t, strings.Contains(Render("quest/zzz"), "Not found"), "bad quest id")
	uassert.True(t, strings.Contains(Render("hunter/nope"), "Not found"), "bad address")
	uassert.True(t, strings.Contains(Render("hunter/"+bob.String()), "has not touched the board"), "unknown hunter")
	uassert.True(t, strings.Contains(Render("nothing"), "Not found"), "unknown route")
}

func TestGnotFormat(cur realm, t *testing.T) {
	uassert.Equal(t, "1 GNOT", gnot(1_000_000))
	uassert.Equal(t, "0.5 GNOT", gnot(500_000))
	uassert.Equal(t, "12.000001 GNOT", gnot(12_000_001))
	uassert.Equal(t, "0 GNOT", gnot(0))
}

func TestSafeLink(cur realm, t *testing.T) {
	uassert.True(t, safeLink("https://example.com/a?b=c#d"))
	uassert.False(t, safeLink("https://"))
	uassert.False(t, safeLink("ftp://example.com"))
	uassert.False(t, safeLink("https://exa mple.com"))
	uassert.False(t, safeLink("https://a.com/)"))
	uassert.False(t, safeLink("https://a.com/<x>"))
}

func strconvItoa(i int) string {
	if i == 0 {
		return "0"
	}
	s := ""
	for i > 0 {
		s = string(rune('0'+i%10)) + s
		i /= 10
	}
	return s
}

func TestRenderJSON(cur realm, t *testing.T) {
	defer reset()
	uassert.Equal(t, `{"realm":"gno.land/r/dev/taproom","now":1234567890,"count":0,"escrow":0,"paid":0,"minReward":1000000,"quests":[]}`, Render("json"))

	issue(2_000_000)
	testing.SetRealm(testing.NewUserRealm(alice))
	testing.SetOriginSend(chain.Coins{{"ugnot", 2_000_000}})
	PostQuest(cross(cur), "Say \"hi\"", "tab\there\nnewline \\ slash", 3)
	testing.SetRealm(testing.NewUserRealm(bob))
	Submit(cross(cur), 1, "done", "https://example.com/x")

	out := Render("json")
	uassert.True(t, strings.Contains(out, `"title":"Say \"hi\""`), "quotes escaped")
	uassert.True(t, strings.Contains(out, `"details":"tab\u0009here\u000anewline \\ slash"`), "control chars and backslash escaped")
	uassert.True(t, strings.Contains(out, `"reward":2000000`), "reward")
	uassert.True(t, strings.Contains(out, `"status":"open"`), "status")
	uassert.True(t, strings.Contains(out, `"answers":[{"hunter":"`+bob.String()+`","note":"done","link":"https://example.com/x"`), "answers")
	uassert.True(t, strings.HasPrefix(out, "{") && strings.HasSuffix(out, "}"), "object")
}
