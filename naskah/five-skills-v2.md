# Naskah v2 — Five skills (format mirip TikTok @nocode.joshua, isi kita sendiri)

Ditulis 2026-11-21. Untuk dua versi yang nanti dibandingkan:
- **Versi A, split screen:** atas kartu demo animasi buatan kita, bawah stickman di ruangan penthouse, caption kata demi kata di tengah.
- **Versi B, caption saja:** video penthouse yang sekarang, ditambah caption kata demi kata dan penanda 1/5.

## Yang ditiru dan yang tidak

| Ditiru (format) | Tidak ditiru (isi & desain dia) |
|---|---|
| Hook yang membalik kebiasaan penonton | Kalimat hook-nya ("Everybody's installing the same Claude skills") |
| Tiap skill = satu hasil konkret yang bisa dilihat | Contoh dia: "Launch Course", kursus Spanish, "50+ principles", halaman $99 |
| Penanda 1/5 dan caption pendek kata demi kata | Warna krem-terakota, font serif, kartu dan tata letak dia |
| Penutup satu ajakan | Wajah kreator; di kita tetap stickman |

## Script ElevenLabs (v3)

76 kata. Take sebelumnya berjalan sekitar 2,3 kata per detik, jadi perkiraan **±33 detik** (batas 35).

```text
[curious] Why pay a tutor, advisor or researcher before you try these five Claude skills?
[instructing] One: chief of staff. Raise money, or cut costs? Advisors answer as one.
Two: anatomy. Ask how anything works. Get a moving machine.
Three: teach. Pick a topic. It remembers your place.
Four: marketing psychology. Why don't visitors buy? It names the bias.
Five: last thirty days. A month of Reddit, one cited brief.
[warm] Commands in the caption. Follow Stickman Ships, because...
```

- "because..." di akhir dibiarkan menggantung, supaya saat diulang nyambung ke "Why pay a tutor...".
- Kalau take lebih dari 34 detik, potong jeda dulu; kalau masih lebih, kirim ke sini.

## Hook

| | Hook | Skor | Formula |
|---|---|---|---|
| A | Before you pay a tutor, advisor or researcher, why not try 5 Claude skills? | 70 WORKABLE (specificity 62, address 76, stakes 62, curiosity 76, brevity 100) | The Question |
| **B (dipakai, pilihan owner 2026-11-21)** | Why pay a tutor, advisor or researcher before you try these 5 Claude skills? | 60 WORKABLE (specificity 62, address 46, stakes 62, curiosity 76, brevity 100) | The Question |

Hook B (dan A) menyebut tiga "pekerjaan" yang memang dikerjakan tiga skill: tutor = teach, advisor = chief-of-staff, researcher = last30days. Skor ini cek kasar: scorer bisa membedakan hook buruk dari yang bagus, tapi tidak bisa menjamin video ramai.

**Teks layar 2 detik pertama** (beda dari yang diucapkan): `HOLD THE HIRE`

## Tiap kalimat dan sumber faktanya

| Kalimat | Dasar dari sumber (dibaca 2026-11-21) |
|---|---|
| Raise money, or cut costs? Advisors answer as one. | chief-of-staff (alirezarezvani) meneruskan pertanyaan founder ke peran C-suite (CFO, CEO, ...) lalu menggabungkan jawabannya. Contoh di file-nya: "Should we raise a bridge or cut to profitability?" |
| Ask how anything works. Get a moving machine. | anatomy menjelaskan ide dengan membangunnya jadi benda isometrik yang bagian-bagiannya bergerak. Contoh README: rate limiter. |
| Pick a topic. It remembers your place. | teach mengajar lewat beberapa sesi; folder-nya jadi ruang belajar dengan catatan dan riwayat belajar. |
| Why don't visitors buy? It names the bias. | marketing-psychology menerapkan bias dan model mental (anchoring, social proof, scarcity, loss aversion) ke marketing. |
| A month of Reddit, one cited brief. | last30days mencari ±30 hari terakhir di Reddit, Hacker News, dll. lalu memberi satu ringkasan dengan sumber. Reddit jalan tanpa API key. |

## Ide kartu demo untuk versi A (desain kita sendiri)

| Skill | Kartu demo |
|---|---|
| chief-of-staff | Pertanyaan "Raise or cut?" masuk, mengalir ke kartu CFO dan CEO, lalu jadi satu kartu jawaban |
| anatomy | Prompt "how does a rate limiter work" berubah jadi mesin isometrik yang bergerak |
| teach | Peta belajar dengan pin "you are here" di lesson terakhir |
| marketing-psychology | Halaman produk dengan satu bagian disorot dan label nama bias muncul |
| last30days | Kalender 30 hari terisi, lalu terlipat jadi satu kartu ringkasan dengan nomor sumber |
