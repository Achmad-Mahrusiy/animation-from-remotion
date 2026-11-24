# Prompt Google Flow — Five skills, luxury penthouse

Siap tempel, satu blok per generate. Timing diambil dari take `voice-flow5.mp3` (34,59 detik).

Semua scene ada di satu penthouse mewah, tapi tiap skill punya ruangannya sendiri yang menggambarkan fungsi skill itu. Pembuka dan penutup ada di kamar tidur, supaya videonya bisa loop.

| Klip | Skill | Ruangan | Kenapa cocok |
|---|---|---|---|
| 1, 2, 8 | pembuka & penutup | Kamar tidur dengan perapian dan chandelier | "kamar mewah" dari brief |
| 3 | chief-of-staff | Ruang rapat direksi pribadi | Pertanyaanmu diteruskan ke advisor yang tepat (CFO, CEO...). Lima kursi kosong = para advisor. |
| 4 | anatomy | Galeri pribadi dengan mesin kuningan di dalam vitrin kaca | Ide dijelaskan sebagai mesin yang bagian-bagiannya bergerak |
| 5 | teach | Perpustakaan pribadi dua lantai dengan papan tulis | Belajar lewat beberapa sesi, dan pelajarannya diingat |
| 6 | marketing-psychology | Butik mewah dengan etalase jam tangan | Kenapa pembeli ragu sebelum membeli |
| 7 | last30days | Ruang media dengan dinding koran dan layar | Membaca diskusi sebulan terakhir dari banyak sumber |

## Cara pakai

1. **Setting Flow:** rasio **9:16 (portrait)**. Jangan crop dari 16:9, nanti stickman-nya terpotong.
2. **Gambar referensi:** generate R1 (karakter) dan R2 (kamar tidur), lalu pilih yang terbaik.
3. **Referensi per klip:**
   - Klip 1, 2, 8: masukkan R1 + R2 di mode "Ingredients to Video" (atau mode lain yang menerima gambar referensi).
   - Klip 3–7: masukkan R1 saja. Ruangannya sudah dijelaskan di prompt.
4. **Generate 2–4 versi**, lalu pilih yang gerakannya paling nyata.
5. **Simpan untuk diedit:** biarkan utuh (sekitar 8 detik), download resolusi tertinggi, simpan di `public/flow5/klip1.mp4` sampai `klip8.mp4`. Aku yang potong dan pas-kan ke suara.

| Klip | Potong (detik) | Panjang | Momen kunci |
|---|---|---|---|
| 1 | 0.00–4.95 | 4.95 s | jari 1-2-3 sekitar 1.5 / 2.4 / 3.3 |
| 2 | 4.95–7.00 | 2.05 s | tepuk tangan + shake di 5.14 |
| 3 | 7.00–12.30 | 5.30 s | bel ditekan di 10.57 |
| 4 | 12.30–17.05 | 4.75 s | mesin mulai bergerak di 15.42 |
| 5 | 17.05–21.80 | 4.75 s | pita pembatas diselipkan di 20.33 |
| 6 | 21.80–26.70 | 4.90 s | tangan di dagu sekitar 25.0 |
| 7 | 26.70–31.05 | 4.35 s | koran jatuh + shake di 28.95, lembar diangkat di 29.80 |
| 8 | 31.05–34.59 | 3.54 s | tunjuk ke atas di 31.20, melambai di 32.70 |

---

## R1 — Gambar referensi karakter

```text
Character sheet of a 2D flat-animated stickman, front view and side view standing next to each other, plain dark teal-gray background. The stickman has thick cream-colored (#f6efe2) lines with round ends for the body, arms and legs, bendy rubber-hose limbs, a large round head outlined with the same thick cream line and filled dark teal-gray (#20323a), two small cream dot eyes, and one curved cream line for a gentle smile. No nose, no hair, no clothes, simple rounded hands. Clean flat 2D vector illustration, even line thickness everywhere, vertical 9:16.
```

## R2 — Gambar referensi kamar tidur (klip 1, 2, 8)

```text
Wide shot of an empty luxurious penthouse bedroom at night, vertical 9:16. Floor-to-ceiling windows with a glowing city skyline, a king bed with a tall dark-green velvet headboard and white silk sheets, a large crystal chandelier in the middle of the room, warm gold wall sconces, a black marble floor with a cream rug, a brown leather armchair beside a stone fireplace with a small fire. Warm amber and deep green palette, soft shadows. Flat 2D vector illustration style, clean shapes, gentle gradients, no people.
```

---

## Klip 1 — Hook, kamar tidur: kursi di samping perapian (0.00–4.95)

```text
Flat 2D vector animation, vertical 9:16. A stickman with thick cream-colored (#f6efe2) round-ended lines for body, arms and legs, bendy rubber-hose limbs, a large round head outlined in the same cream line and filled dark teal-gray (#20323a), two small cream dot eyes and one curved cream line for a mouth, no nose, no hair, no clothes. Setting: a luxurious penthouse bedroom at night with floor-to-ceiling windows and a glowing city skyline, black marble floor, cream rug, warm gold sconces, warm amber and deep green palette.

Wide shot of a brown leather armchair beside a stone fireplace with a small flickering fire. The stickman sits relaxed in the armchair with his legs crossed. He turns his head and body toward the camera, raises one hand and counts one, two, three on his fingers, slowly and clearly, one count per second. He blinks once and smiles.

Steady locked-off camera, no camera shake, no zoom. The stickman stays in the lower two thirds of the frame; keep the top third calm and empty. His mouth does not move as if speaking. No dialogue, no voice, no music, no on-screen text, no subtitles, no logos.
```

## Klip 2 — "Five skills. Here's how." Kamar tidur: di bawah chandelier (4.95–7.00)

```text
Flat 2D vector animation, vertical 9:16. A stickman with thick cream-colored (#f6efe2) round-ended lines for body, arms and legs, bendy rubber-hose limbs, a large round head outlined in the same cream line and filled dark teal-gray (#20323a), two small cream dot eyes and one curved cream line for a mouth, no nose, no hair, no clothes. Setting: a luxurious penthouse bedroom at night, black marble floor, cream rug, a large crystal chandelier, warm amber and deep green palette.

Medium-wide shot in the middle of the room under the crystal chandelier. Right at the very start of the clip, the stickman claps his hands once with a strong snap, and at the exact moment of the clap the chandelier glows brighter. Then he spreads his arms wide and smiles big at the camera.

One short camera shake on the clap only; otherwise a steady locked-off camera, no zoom. Keep the top third of the frame empty. His mouth does not move as if speaking. No dialogue, no voice, no music, no on-screen text, no subtitles, no logos.
```

## Klip 3 — chief-of-staff: ruang rapat direksi (7.00–12.30)

```text
Flat 2D vector animation, vertical 9:16. A stickman with thick cream-colored (#f6efe2) round-ended lines for body, arms and legs, bendy rubber-hose limbs, a large round head outlined in the same cream line and filled dark teal-gray (#20323a), two small cream dot eyes and one curved cream line for a mouth, no nose, no hair, no clothes. Setting: a private executive boardroom inside a luxurious penthouse at night: a long polished dark walnut boardroom table, five empty high-back leather chairs along its sides, each with a small blank brass nameplate on the table in front of it, wood-paneled walls with gold trim, a tall window with the city skyline, warm brass pendant lights. Warm amber and deep green palette.

Medium-wide shot from the far end of the table. The stickman sits at the head of the table in the tallest leather chair, like a company boss, looking calm. About two thirds into the clip he taps a small brass service bell on the table once with one finger, and the pendant light above each of the five empty chairs switches on, one after another. He leans back and puts both hands behind his head, satisfied.

Steady locked-off camera, no camera shake, no zoom. Keep the top third of the frame empty. His mouth does not move as if speaking. No dialogue, no voice, no music, no on-screen text, no subtitles, no logos.
```

## Klip 4 — anatomy: galeri pribadi dengan mesin kuningan (12.30–17.05)

```text
Flat 2D vector animation, vertical 9:16. A stickman with thick cream-colored (#f6efe2) round-ended lines for body, arms and legs, bendy rubber-hose limbs, a large round head outlined in the same cream line and filled dark teal-gray (#20323a), two small cream dot eyes and one curved cream line for a mouth, no nose, no hair, no clothes. Setting: a private gallery room inside a luxurious penthouse at night: dark green walls, a black marble floor, soft gallery spotlights from the ceiling, and in the center a tall glass display case on a white marble pedestal holding a polished brass isometric machine with visible gears, small pistons and copper pipes. Warm amber and deep green palette.

Medium shot. The stickman stands beside the glass case and leans in to look closely. About two thirds into the clip he turns a small brass crank on the pedestal with one hand; inside the case the gears start turning smoothly, the pistons move up and down, and a few small parts glow warm amber. He points at the moving machine with his other hand and smiles.

Steady locked-off camera, no camera shake, no zoom. Keep the top third of the frame empty. His mouth does not move as if speaking. No dialogue, no voice, no music, no on-screen text, no subtitles, no logos.
```

## Klip 5 — teach: perpustakaan pribadi (17.05–21.80)

```text
Flat 2D vector animation, vertical 9:16. A stickman with thick cream-colored (#f6efe2) round-ended lines for body, arms and legs, bendy rubber-hose limbs, a large round head outlined in the same cream line and filled dark teal-gray (#20323a), two small cream dot eyes and one curved cream line for a mouth, no nose, no hair, no clothes. Setting: a two-storey private library inside a luxurious penthouse at night: floor-to-ceiling dark wooden bookshelves full of leather books, a brass rolling ladder, a green-shaded banker's lamp on a reading table, and a blank dark green chalkboard on a wooden easel. Warm amber and deep green palette.

Medium shot at the bookshelves. The stickman pulls one thick green book from the shelf and opens it in both hands. About two thirds into the clip he slides a red ribbon bookmark between the pages, closes the book and puts it back in exactly the same place. His head and eyes follow the book the whole time.

Steady locked-off camera, no camera shake, no zoom. Keep the top third of the frame empty. His mouth does not move as if speaking. No dialogue, no voice, no music, no on-screen text, no subtitles, no logos.
```

## Klip 6 — marketing-psychology: butik jam tangan (21.80–26.70)

```text
Flat 2D vector animation, vertical 9:16. A stickman with thick cream-colored (#f6efe2) round-ended lines for body, arms and legs, bendy rubber-hose limbs, a large round head outlined in the same cream line and filled dark teal-gray (#20323a), two small cream dot eyes and one curved cream line for a mouth, no nose, no hair, no clothes. Setting: a private luxury boutique room inside a penthouse at night: glass display shelves with warm backlighting, a few designer bags and shoes on the shelves, a black marble display counter with a dark velvet tray. Warm amber and deep green palette.

Medium shot at the display counter. On the velvet tray lie two gold wristwatches, each with a small blank paper tag. The stickman looks at the left watch, then at the right watch, like a buyer who cannot decide. About two thirds into the clip he rests one hand on his chin, unsure, then picks up the right watch and nods.

Steady locked-off camera, no camera shake, no zoom. Keep the top third of the frame empty. His mouth does not move as if speaking. No dialogue, no voice, no music, no on-screen text, no subtitles, no logos.
```

## Klip 7 — last30days: ruang media (26.70–31.05)

```text
Flat 2D vector animation, vertical 9:16. A stickman with thick cream-colored (#f6efe2) round-ended lines for body, arms and legs, bendy rubber-hose limbs, a large round head outlined in the same cream line and filled dark teal-gray (#20323a), two small cream dot eyes and one curved cream line for a mouth, no nose, no hair, no clothes. Setting: a luxurious media room inside a penthouse at night: one wall covered with a grid of small glowing screens showing abstract charts and blurry shapes, framed newspaper front pages on the other wall with unreadable blurred print, a deep green velvet sofa with a low marble coffee table. Warm amber and deep green palette.

Medium shot in front of the coffee table. The stickman stands holding a tall stack of newspapers in both arms. Halfway through the clip he drops the stack onto the marble coffee table; the papers land with a thump and spread out. Right after, he pulls a single page from the pile and holds it up toward the camera.

One short camera shake on the impact of the papers only; otherwise a steady locked-off camera, no zoom. Keep the top third of the frame empty. His mouth does not move as if speaking. No dialogue, no voice, no music, no on-screen text, no subtitles, no logos.
```

## Klip 8 — Outro, kamar tidur: kembali ke perapian (31.05–34.59)

```text
Flat 2D vector animation, vertical 9:16. A stickman with thick cream-colored (#f6efe2) round-ended lines for body, arms and legs, bendy rubber-hose limbs, a large round head outlined in the same cream line and filled dark teal-gray (#20323a), two small cream dot eyes and one curved cream line for a mouth, no nose, no hair, no clothes. Setting: a luxurious penthouse bedroom at night with floor-to-ceiling windows and a glowing city skyline, black marble floor, cream rug, warm amber and deep green palette.

Wide shot of the brown leather armchair beside the stone fireplace with a small flickering fire, the same framing as the opening shot. The stickman sits in the armchair. At the very start he points up toward the top of the frame with one finger, then halfway through he gives a small friendly wave to the camera.

Steady locked-off camera, no camera shake, no zoom. Keep the top third of the frame empty. His mouth does not move as if speaking. No dialogue, no voice, no music, no on-screen text, no subtitles, no logos.
```

---

## Kalau hasilnya melenceng

- **Stickman berubah bentuk** (garis tipis, kepala putih, tumbuh baju): masukkan lagi R1, lalu tambahkan di awal prompt "Match the reference character exactly."
- **Kamar tidur di klip 1, 2, 8 berbeda-beda:** masukkan R2 dan tulis "Same room as the reference image."
- **Ruangan terlalu ramai sampai stickman tenggelam:** hapus satu-dua benda dari bagian "Setting".
- **Gerakan terlalu cepat atau terlalu banyak:** hapus satu aksi dari prompt. Satu klip, satu aksi utama.
- **Muncul tulisan acak** (di papan nama, koran, layar): generate ulang. Teks yang benar ditambah di editor.
- **Mulut bergerak seperti bicara:** pilih versi yang mulutnya diam, karena nanti tidak akan sinkron dengan VO.
