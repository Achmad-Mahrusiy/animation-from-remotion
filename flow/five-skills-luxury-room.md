# Five skills, used right — versi Google Flow

Dibuat 2026-11-21. Stickman menjelaskan 5 skill (chief-of-staff, anatomy, teach, marketing-psychology, last30days) di sebuah penthouse mewah: pembuka dan penutup di kamar tidur, tiap skill di ruangan yang sesuai fungsinya. Voice dari ElevenLabs, video dari Google Flow, digabung di editor (CapCut / Premiere).

Target: 9:16, sekitar 33 detik (batas channel 35 detik), 80 kata.

---

## 1. Fakta tiap skill (dibaca dari sumber aslinya, 2026-11-21)

| Skill | Apa yang dilakukan | Cara pakai yang tepat | Install (BELUM dijalankan) | Catatan |
|---|---|---|---|---|
| **chief-of-staff** (alirezarezvani/claude-skills) | Lapisan "kepala staf" antara founder dan C-suite: pertanyaanmu diarahkan ke peran yang tepat (CFO, CEO, dst.), lalu jawabannya digabung jadi satu. Pertanyaan yang rumit memicu "board meeting" sampai 5 peran. Keputusan dicatat di `~/.claude/decisions/`. | Tanya pertanyaan bisnis/keputusan, bukan soal kode. Contoh dari file: `[INVOKE:cfo\|What's the right runway target given our growth rate?]` (file tidak bilang apakah ini diketik user atau dipakai agent sendiri). | `/plugin marketplace add alirezarezvani/claude-skills` lalu `/plugin install c-level-skills@claude-code-skills` | Butuh skill pendamping (context-engine, agent-protocol), jadi pasang plugin lengkapnya. Ada beberapa skill lain bernama sama; yang dipakai di sini versi alirezarezvani. |
| **anatomy** (wheresryan22/anatomy) | Menjelaskan sebuah ide dengan membangunnya jadi benda kerja: gambar isometrik (SVG / WebGL) dengan bagian yang bergerak dan angka yang hidup. | `/anatomy` + apa yang mau dijelaskan. Contoh README: `/anatomy explain how a token bucket rate limiter works, interactive` | `npx skills add wheresryan22/anatomy -g -a claude-code` | Butuh Node.js 20.10+. Tanpa API key. |
| **teach** (mattpocock/skills) | Mengajarimu skill/konsep baru lewat beberapa sesi. Folder tempat kamu menjalankannya jadi "ruang belajar" (MISSION.md, NOTES.md, lesson HTML, dll.). | Hanya jalan kalau kamu ketik: `/teach <topik>`. Jalankan di folder khusus, karena dia menulis file di folder itu. | `npx -y skills add mattpocock/skills --skill teach --agent claude-code` (atau plugin lengkap: `claude plugin install mattpocock-skills@claude-plugins-official`) | Pilih salah satu cara install, jangan dua-duanya (README: nanti skill-nya dobel). |
| **marketing-psychology** (coreyhaines31/marketingskills) | Menerapkan model mental & bias psikologi ke marketing (anchoring, social proof, scarcity, loss aversion, framing), dan cara memakainya dengan jujur. | Tanya biasa, tidak ada slash command. Misal: "why do visitors hesitate on my pricing page?". Kalau ada `.agents/product-marketing.md`, dia baca itu dulu. | `npx skills add coreyhaines31/marketingskills --skill marketing-psychology -a claude-code` (disusun dari pola README, belum dicoba) | Tanpa API key. |
| **last30days** (mvanhorn/last30days-skill) | Mencari satu topik di banyak sumber sekaligus (Reddit, X, YouTube, Hacker News, Polymarket, GitHub, dll.) untuk ±30 hari terakhir, lalu memberi satu ringkasan dengan sumber. | `/last30days <topik>`. Contoh README: `/last30days what's exploding in AI agents?` | `/plugin marketplace add mvanhorn/last30days-skill` lalu `/plugin install last30days` | Butuh Python 3.12+. Reddit, HN, Polymarket, GitHub langsung jalan; X, YouTube, TikTok butuh key / tool tambahan. |

Sumber: README/SKILL.md di GitHub masing-masing repo (lihat bagian 7).

---

## 2. Script VO untuk ElevenLabs (v3)

80 kata, perkiraan 32–33 detik. Voice: Lucan Rook (Energetic Male), seperti video sebelumnya. Tempel apa adanya:

```text
[curious] What if your AI could teach you, advise you, and read the last thirty days?
[confident] Five skills. Here's how.
[instructing] One: chief of staff. Ask a business question. The right advisor answers.
Two: anatomy. Name one idea. You get a moving machine.
Three: teach. Run it in its own folder. It remembers your lessons.
Four: marketing psychology. Ask why buyers hesitate on your page.
Five: last thirty days. One topic. One cited brief.
[warm] Commands in the caption. Follow Stickman Ships, because...
```

- Kalimat terakhir sengaja menggantung ("because...") supaya saat video diulang, masuk lagi ke "What if your AI could...". Biarkan suaranya trailing off.
- Kalau take lebih dari 34 detik, potong jeda antar kalimat dulu sebelum mempercepat suara.

### Hook

| | Hook | Skor | Formula |
|---|---|---|---|
| **A (dipakai)** | What if your AI could teach you, advise you, and read the last 30 days? 5 skills. Here's how. | 60 WORKABLE (specificity 90, address 100, stakes 36, curiosity 58, brevity 100) | The Question |
| B | Your AI can teach you, research the last 30 days, and draw how anything works. But only with these 5 skills. | 60 WORKABLE (specificity 90, address 96, stakes 36, curiosity 58, brevity 100) | — |

Kenapa A: benar untuk penonton yang belum punya satu pun skill ini, dan langsung menyebut 3 dari 5 janji videonya. Hook awal yang berbunyi "you're wasting 5 skills" skornya lebih tinggi (69) tapi dibuang, karena menganggap penonton sudah meng-install kelimanya, padahal belum. Catatan jujur: skor naik karena kata-katanya disesuaikan dengan daftar kata yang dicari scorer; scorer bisa membedakan hook buruk dari yang bagus, tapi tidak bisa membedakan hit dari yang gagal.

### Teks layar 2 detik pertama (beda dari yang diucapkan)

`TEACHER. ADVISOR. RESEARCHER.`

---

## 3. Cara bikin di Google Flow (lakukan ini dulu)

Ini belum dites di Flow dari sisi ini. Cek dulu di Flow: rasio 9:16 tersedia untuk model yang kamu pakai, dan panjang klip (biasanya 8 detik).

1. **Gambar referensi dulu, dua buah**, pakai generator gambar di Flow:
   - Karakter: tempel CHARACTER BLOCK + "full body character sheet, front view and side view, plain dark teal background".
   - Kamar: tempel ROOM BLOCK + "wide shot, empty room, vertical 9:16".
2. **Klip 1, 2, 8 pakai R1 + R2; klip 3–7 pakai R1 saja**, karena tiap skill punya ruangannya sendiri (lihat flow-prompts.md).
3. **Satu prompt per klip** (bagian 5). Generate 2–4 variasi, pilih yang gerakannya paling nyata.
4. **Matikan audio dari Flow** saat edit. Suara hanya dari ElevenLabs + SFX.
5. **Semua teks ditambah di editor**, bukan di Flow (AI video sering merusak tulisan). Caption di bagian atas layar, di atas kepala stickman.

### CHARACTER BLOCK (tempel persis di setiap prompt)

```text
A 2D flat-animated stickman: thick cream-colored (#f6efe2) lines with round ends for the body, arms and legs, bendy rubber-hose limbs, a large round head outlined with the same thick cream line and filled dark teal-gray (#20323a), two small cream dot eyes, one curved cream line for a mouth, no nose, no hair, no clothes. He is tall and fills about half of the frame height. His mouth does not move as if speaking.
```

### ROOM BLOCK (kamar tidur, untuk klip 1, 2, 8)

```text
Inside a luxurious penthouse bedroom at night: floor-to-ceiling windows with a glowing city skyline, a king bed with a tall dark-green velvet headboard and white silk sheets, a crystal chandelier, warm gold wall sconces, a black marble floor with a cream rug, a walnut writing desk, a brown leather armchair beside a stone fireplace with a small fire, tall bookshelves with a brass ladder, a walk-in closet with glass doors. Warm amber and deep green palette, soft shadows. Flat 2D vector illustration style, clean shapes, gentle gradients.
```

### Aturan di setiap prompt (tempel di akhir)

```text
Vertical 9:16. Steady locked-off camera, no camera shake, no zoom. No dialogue, no voice, no music, no on-screen text, no subtitles, no logos.
```

Untuk 2 klip yang punya "hit" (klip 2 dan 7), ganti "no camera shake" jadi "one short camera shake on the impact only". Total 2 shake di video, sesuai aturan channel (maksimal sekitar 3, hanya saat benturan).

---

## 4. Scene breakdown

**Waktu DIUKUR** dari take `ElevenLabs_2026-11-21T06_40_00_Lucan Rook  - Energetic Male_pvc_s50_sim75_v4.mp3` (disalin ke `public/voice-flow5.mp3`), 34,59 detik. Semua titik potong jatuh di jeda antar kalimat. "Momen kunci" = detik di timeline tempat aksi penting harus terjadi; geser klip Flow-nya sampai frame aksi itu pas di detik tersebut.

| # | Potong (detik) | Panjang klip | VO (detik ucapan) | Sudut kamar | Aksi stickman | Momen kunci | Teks layar (editor) |
|---|---|---|---|---|---|---|---|
| 1 | 0.00–4.95 | 4.95 s | What if your AI could teach you, advise you, and read the last thirty days? (0.13–4.63) | Kursi kulit di samping perapian, wide | Duduk santai, menoleh ke kamera, menghitung tiga dengan jari | Jari 1-2-3 pada "teach" ~1.5, "advise" ~2.4, "read" ~3.3 | `TEACHER. ADVISOR. RESEARCHER.` |
| 2 | 4.95–7.00 | 2.05 s | Five skills. (5.14–5.94) Here's how. (6.24–6.69) | Tengah kamar di bawah chandelier | Berdiri, tepuk tangan sekali, chandelier makin terang (shake 1) | Tepuk tangan + shake di 5.14 | `5 SKILLS, USED RIGHT` |
| 3 | 7.00–12.30 | 5.30 s | One: (7.17) chief of staff. (7.86–8.63) Ask a business question. (9.10–10.17) The right advisor answers. (10.57–12.01) | Ruang rapat direksi: meja panjang, 5 kursi kosong (= para advisor) | Duduk di ujung meja, menekan bel kuningan, lampu di atas 5 kursi menyala satu per satu, lalu bersandar | Bel ditekan di 10.57 ("The right advisor") | `1. chief-of-staff` / `ask a business question` |
| 4 | 12.30–17.05 | 4.75 s | Two: (12.45) anatomy. (13.09–13.61) Name one idea. (14.01–15.08) You get a moving machine. (15.42–16.63) | Galeri pribadi: mesin kuningan di dalam vitrin kaca | Memutar engkol, roda gigi dan piston mesin bergerak, dia menunjuk sambil tersenyum | Gigi mulai berputar di 15.42 | `2. /anatomy how a CDN cache works` |
| 5 | 17.05–21.80 | 4.75 s | Three: (17.20) teach. (17.92–18.32) Run it in its own folder. (18.65–20.04) It remembers your lessons. (20.33–21.54) | Perpustakaan pribadi dua lantai + papan tulis | Menarik buku, membukanya, menyelipkan pita pembatas, mengembalikannya | Pita diselipkan di 20.33 | `3. /teach <topic>` / `in its own folder` |
| 6 | 21.80–26.70 | 4.90 s | Four: (21.96) marketing psychology. (22.60–23.74) Ask why buyers hesitate on your page. (24.14–26.46) | Butik mewah: etalase jam tangan | Seperti pembeli yang ragu: melihat dua jam tangan, tangan di dagu, lalu memilih satu | Tangan di dagu pada "hesitate" ~25.0 | `4. marketing-psychology` / `"why do buyers hesitate?"` |
| 7 | 26.70–31.05 | 4.35 s | Five: (26.85) last thirty days. (27.57–28.65) One topic. (28.95–29.62) One cited brief. (29.80–30.84) | Ruang media: dinding layar + koran berbingkai | Menjatuhkan tumpukan koran ke meja marmer (shake 2), menarik satu lembar dan mengangkatnya | Koran jatuh + shake di 28.95, lembar diangkat di 29.80 | `5. /last30days <topic>` |
| 8 | 31.05–34.59 | 3.54 s | Commands in the caption. (31.20–32.27) Follow Stickman Ships, because... (32.70–34.37) | Kursi kulit di samping perapian (sama seperti scene 1, untuk loop) | Duduk kembali, menunjuk ke atas (ke caption), melambai | Tunjuk ke atas di 31.20, lambaian di 32.70 | `COMMANDS IN THE CAPTION` |

Semua klip di bawah 8 detik, jadi satu generate Flow cukup untuk tiap scene. Pencocokan: 25 potongan suara ke 24 frasa, berurutan; hanya kalimat pertama yang terbagi dua (jeda kecil di 2.91–3.06), itu disimpulkan dari panjangnya. Detik di dalam satu kalimat (misal "teach" ~1.5) masih perkiraan.

---

## 5. Prompt Flow per klip

Versi lengkap siap tempel (tiap skill punya ruangannya sendiri, plus timing per klip) ada di [flow-prompts.md](flow-prompts.md).

---

## 6. Caption (perintah install)

Semua perintah di bawah **belum dijalankan** dari sisi ini. Coba sekali sebelum upload.

```text
1. chief-of-staff
/plugin marketplace add alirezarezvani/claude-skills
/plugin install c-level-skills@claude-code-skills

2. anatomy
npx skills add wheresryan22/anatomy -g -a claude-code
then: /anatomy explain how a token bucket rate limiter works

3. teach
npx -y skills add mattpocock/skills --skill teach --agent claude-code
then: /teach <topic>  (run it in its own folder)

4. marketing-psychology
npx skills add coreyhaines31/marketingskills --skill marketing-psychology -a claude-code
then just ask: "why do buyers hesitate on my page?"

5. last30days
/plugin marketplace add mvanhorn/last30days-skill
/plugin install last30days
then: /last30days <topic>  (needs Python 3.12+)
```

---

## 7. Yang belum dicek / risiko

- Prompt Flow belum dites. Rasio 9:16, panjang klip, dan konsistensi karakter tergantung model Flow yang kamu pakai.
- Video 2D dari AI sering tidak konsisten (tebal garis, warna kepala). Kalau melenceng, pakai gambar referensi yang sama lagi dan generate ulang.
- Timing scene diukur dari jeda di take (bukan didengar). Sync belum dicek dengan telinga.
- Take 34,59 detik, hanya 0,4 detik di bawah batas 35. Tidak ada ruang untuk ekor/outro tambahan.
- Tidak ada satu pun install line yang sudah dijalankan. Perintah marketing-psychology disusun dari pola README, bukan disalin langsung.
- chief-of-staff dan marketing-psychology itu skill bisnis/marketing, agak di luar niche "AI coding". Itu keputusanmu.

Sumber yang dibaca 2026-11-21:
- https://raw.githubusercontent.com/alirezarezvani/claude-skills/main/c-level-advisor/skills/chief-of-staff/SKILL.md dan README repo itu
- https://raw.githubusercontent.com/wheresryan22/anatomy/main/README.md
- https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/teach/SKILL.md dan https://github.com/mattpocock/skills
- https://raw.githubusercontent.com/coreyhaines31/marketingskills/main/skills/marketing-psychology/SKILL.md dan README repo itu
- https://raw.githubusercontent.com/mvanhorn/last30days-skill/main/README.md
