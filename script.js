/* === HLAVNÍ SKRIPT FYZIKA HROU (FINÁLNÍ VERZE) === */

// 1. PŘEPÍNÁNÍ SEKCÍ A FILTROVÁNÍ
function prepnoutSekci(idSekce, filtr = null) {
    
    // Skryjeme všechny sekce
    document.querySelectorAll('.obsah-sekce').forEach(s => s.style.display = 'none');

    // Zobrazíme vybranou sekci
    const sekce = document.getElementById(idSekce);
    if (sekce) {
        sekce.style.display = 'block';

        // FILTROVÁNÍ (ZŠ / SŠ)
        const bloky = sekce.querySelectorAll('.ucivo-blok');
        bloky.forEach(blok => {
            const tagyBloku = blok.getAttribute('data-tags');
            if (filtr === null) {
                // Žádný filtr = zobrazit vše
                blok.classList.remove('hidden-by-filter');
            } else {
                // Máme filtr = zobrazit jen shodné
                if (tagyBloku && tagyBloku.includes(filtr)) {
                    blok.classList.remove('hidden-by-filter');
                } else {
                    blok.classList.add('hidden-by-filter');
                }
            }
        });
    }

    // Reset hledání (aby nezůstal text v poli)
    if(idSekce !== 'vyhledavani') {
        const s = document.getElementById('search-input');
        if(s) s.value = '';
    }

    // Obnova MathJaxu (vzorečky)
    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}


// 2. UNIVERZÁLNÍ KONTROLA VÝSLEDKŮ (Pro malé kalkulačky)
function zkontroluj(idInputu, idVystupu, spravnaHodnota) {
    const vstup = document.getElementById(idInputu);
    const vystup = document.getElementById(idVystupu);
    let hodnota = parseFloat(vstup.value.replace(',', '.'));

    if (Math.abs(hodnota - spravnaHodnota) < 0.1) {
        vystup.innerHTML = "✅ Správně!";
        vystup.className = "text-success fw-bold mt-2";
    } else {
        vystup.innerHTML = "❌ Zkus to znovu.";
        vystup.className = "text-danger fw-bold mt-2";
    }
}


// 3. CHYTRÉ VYHLEDÁVÁNÍ (Prohledává text na stránce)
function hledatObsah() {
    let hledanyText = document.getElementById('search-input').value.toLowerCase();
    if (hledanyText.length < 3) return; // Hledáme až od 3 písmen

    const vsechnyBloky = document.querySelectorAll('.ucivo-blok');

    for (let blok of vsechnyBloky) {
        let textBloku = blok.textContent.toLowerCase();

        if (textBloku.includes(hledanyText)) {
            // Našli jsme shodu -> zjistíme sekci
            let rodicovskaSekce = blok.closest('.obsah-sekce');

            if (rodicovskaSekce) {
                // Přepneme zobrazení ručně (bez mazání inputu)
                document.querySelectorAll('.obsah-sekce').forEach(s => s.style.display = 'none');
                rodicovskaSekce.style.display = 'block';
                
                if (window.MathJax) MathJax.typesetPromise();

                // Scroll a efekt
                blok.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                blok.style.transition = "0.3s";
                blok.style.border = "3px solid #6c5ce7";
                blok.style.transform = "scale(1.02)";

                setTimeout(() => {
                    blok.style.border = "none";
                    blok.style.transform = "scale(1)";
                }, 1500);

                return; // Našli jsme první, končíme
            }
        }
    }
}


// 4. LOGIKA PRO TRENAŽÉR PŘEVODŮ (Délka, Hmotnost, Čas, Objem)
let aktualniDrill = { spravnaOdpoved: 0 };

function generujPriklad(typ) {
    const drillZadani = document.getElementById('drill-zadani');
    const drillJednotka = document.getElementById('drill-jednotka');
    const drillInput = document.getElementById('drill-input');
    const drillFeedback = document.getElementById('drill-feedback');

    // Reset
    drillInput.value = '';
    drillFeedback.innerHTML = '';
    drillInput.focus();

    const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    let zadaniText, vysledek, cilovaJednotka;
    let varianty = [];
    let cislo = 0;

    if (typ === 'delka') {
        varianty = [
            { txt: "km", val: 1000 }, { txt: "m", val: 1 },
            { txt: "dm", val: 0.1 }, { txt: "cm", val: 0.01 }, { txt: "mm", val: 0.001 }
        ];
        cislo = r(1, 100);
    } else if (typ === 'hmotnost') {
        varianty = [
            { txt: "t", val: 1000000 }, { txt: "kg", val: 1000 },
            { txt: "g", val: 1 }, { txt: "mg", val: 0.001 }
        ];
        cislo = r(1, 50);
    } else if (typ === 'cas') {
        varianty = [
            { txt: "dní", val: 86400 }, { txt: "h", val: 3600 },
            { txt: "min", val: 60 }, { txt: "s", val: 1 }
        ];
        cislo = r(1, 10);
    } else if (typ === 'objem') {
        varianty = [
            { txt: "m³", val: 1000 }, { txt: "hl", val: 100 },
            { txt: "dm³ (l)", val: 1 }, { txt: "cm³ (ml)", val: 0.001 }
        ];
        cislo = r(1, 20);
    }

    const z = varianty[r(0, varianty.length - 1)];
    const do_ = varianty[r(0, varianty.length - 1)];

    if (z.txt === do_.txt) { generujPriklad(typ); return; }

    vysledek = (cislo * z.val) / do_.val;
    vysledek = parseFloat(vysledek.toFixed(4));

    drillZadani.innerText = `Převeď: ${cislo} ${z.txt} = ?`;
    drillJednotka.innerText = do_.txt;
    aktualniDrill.spravnaOdpoved = vysledek;
}

function zkontrolujDrill() {
    const drillInput = document.getElementById('drill-input');
    const drillFeedback = document.getElementById('drill-feedback');
    let uzivatel = parseFloat(drillInput.value.replace(',', '.'));

    if (isNaN(uzivatel)) {
        drillFeedback.innerHTML = `<span class="text-warning">⚠️ Zadej číslo!</span>`;
        return;
    }
    if (Math.abs(uzivatel - aktualniDrill.spravnaOdpoved) < 0.0001) {
        drillFeedback.innerHTML = `<span class="text-success">✅ Správně!</span>`;
    } else {
        drillFeedback.innerHTML = `<span class="text-danger">❌ Chyba. Správně je ${aktualniDrill.spravnaOdpoved}</span>`;
    }
}


// 5. KALKULAČKY PRO VESMÍR
function spocitejVahu() {
    const val = parseFloat(document.getElementById('inp-vaha-zeme').value);
    if(isNaN(val)) return;
    document.getElementById('vystup-vaha').innerHTML = `
        <ul class="list-group">
            <li class="list-group-item d-flex justify-content-between">Země: <b>${(val*9.81).toFixed(1)} N</b></li>
            <li class="list-group-item d-flex justify-content-between">Měsíc: <b>${(val*1.62).toFixed(1)} N</b></li>
            <li class="list-group-item d-flex justify-content-between">Jupiter: <b>${(val*24.79).toFixed(1)} N</b></li>
        </ul>`;
    document.getElementById('vystup-vaha').style.display = 'block';
}

function spocitejKeplera() {
    const a = parseFloat(document.getElementById('inp-kepler').value);
    if (isNaN(a) || a <= 0) {
        document.getElementById('msg-kepler').innerHTML = "❌ Zadej kladnou vzdálenost!";
        return;
    }
    const T = Math.sqrt(Math.pow(a, 3));
    document.getElementById('msg-kepler').innerHTML = `✅ Oběhne Slunce za <strong>${T.toFixed(1)} let</strong>.`;
}


// 6. INITIALIZACE - SPUSTIT PŘI STARTU
document.addEventListener('DOMContentLoaded', () => {
    prepnoutSekci('uvod');
    generujPriklad('delka'); // Aby v trenažéru něco bylo hned
});