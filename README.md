# Greatec

Hemsida för Greatec, en redovisningsbyrå för småföretag och enskilda firmor. Statisk one-pager: `index.html`, `styles.css` och `script.js`, utan byggsteg.

## Innehåll

- Hero med exempelverifikation, statistikrad och förtroendepunkter
- Om oss, tjänster och vilka bokföringssystem byrån arbetar i
- **Viktiga datum**: nästa deadline för arbetsgivardeklaration och moms (månad/kvartal), räknas fram utifrån dagens datum
- Prispaket (Start, Bas, Växa) kopplade till en priskalkylator
- Kundomdömen, vanliga frågor och kontaktformulär
- Mörkt/ljust läge, mobilmeny, aktiv länk i menyn och diskreta scroll-animationer

## Innan publicering

Sidan innehåller exempeluppgifter som ska bytas ut:

- **Priser**: `PRICES` och `PRESETS` högst upp i `script.js`
- **Kontaktformulär**: sätt `FORM_ENDPOINT` i `script.js` till t.ex. en Formspree-adress, annars skickas inget
- **Kontaktuppgifter**: e-post och telefon i `index.html` (kontaktsektionen och sidfoten)
- **Statistik och omdömen**: siffrorna i statistikraden och kundcitaten är exempel
- **Systemlistan** under Om oss och uppsägningstiden i FAQ

## Köra lokalt

Öppna `index.html` i webbläsaren, eller publicera med GitHub Pages (Settings → Pages → branch `main`, mapp `/`).
