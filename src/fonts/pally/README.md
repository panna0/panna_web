# Pally — trascina qui i file

Servono questi 3 file, con **questi nomi esatti** (maiuscole comprese):

| File                | Peso | Utilizzo                 |
| ------------------- | ---- | ------------------------ |
| `Pally-Regular.otf` | 400  | testo normale            |
| `Pally-Medium.otf`  | 500  | testo in leggero risalto |
| `Pally-Bold.otf`    | 700  | titoli e grassetti       |

Se i tuoi file hanno nomi diversi, rinominali così oppure aggiorna i percorsi
in `src/fonts/pally.ts`.

Appena i file sono qui il font è già collegato: nessuna altra modifica al
codice. Fino a quel momento il dev server segnala i file mancanti.

## Versione variable

Se hai anche il file variable (`Pally-Variable.ttf` o `.woff2`), puoi usare
quello da solo al posto dei tre statici: mettilo in questa cartella e in
`src/fonts/pally.ts` sostituisci l'array `src` con la variante commentata a
fondo file.

## Nota sul formato

Gli `.otf` funzionano, ma sono più pesanti e Next non li può precaricare.
Per la produzione conviene convertirli in `.woff2` (per esempio con
[Fontsquirrel](https://www.fontsquirrel.com/tools/webfont-generator) o
`fonttools`) e aggiornare le estensioni in `src/fonts/pally.ts`.
