function setupDownloadButton(icsEvents) {
    const downloadButton = document.getElementById('downloadDatesButton');
    downloadButton.style.display = 'flex'; // Affichez le bouton

    downloadButton.onclick = () => {
        downloadICS(icsEvents);
    };
}

function generateCalendar() {
    const status = document.getElementById('status').value;
    const caDeclaration = document.getElementById('caDeclaration').value;
    const tvaFrequency = document.getElementById('tvaFrequency').value;
    const urssafFrequency = document.getElementById('urssafFrequency').value;
    const caSup = document.getElementById('caSup').value;
    const salaryTaxe = document.getElementById('SalaryTaxe').value;

    document.getElementById('calendarContainer').style.display = 'block';
    document.getElementById('resetButton').style.display = 'flex';
    document.getElementById('slider').style.display = 'none';

    const calendarEl = document.getElementById('calendar');
    calendarEl.innerHTML = '';

    const fiscalDates = getFiscalDates(status, tvaFrequency, urssafFrequency, caSup, salaryTaxe, caDeclaration);

    for (let m = 1; m <= 12; m++) {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${getMonthName(m)}</strong><ul class="fiscal-duties"></ul>`;

        const dutiesEl = li.querySelector('.fiscal-duties');

        fiscalDates.filter(date => date.month === m).forEach(date => {
            if (!(status === 'auto-entrepreneur' && caDeclaration === 'non' && date.duty.includes("TVA"))) {
                const dutyLi = document.createElement('li');
                // Ajout de l'attribut data-duty ici
                dutyLi.setAttribute('data-duty', date.duty.split(' ')[0]);  // Extrait le premier mot comme URSSAF, CFE, etc.
                
                const eventTitle = encodeURIComponent(date.duty);
                const description = encodeURIComponent("Date limite pour " + date.duty);
                const year = new Date().getFullYear();
                const monthPadded = ('0' + date.month).slice(-2);
                const dayPadded = ('0' + date.day).slice(-2);
                const service = 'google'; // Exemple avec Google, ajustez selon le besoin
                const timezone = encodeURIComponent('Europe/Paris'); // Ajustez selon le besoin
                const startDate = `${year}-${monthPadded}-${dayPadded}T00:00:00`; // Début de la journée
                const endDate = `${year}-${monthPadded}-${dayPadded}T23:59:00`; // Fin de la journée
                const calUrl = `https://calndr.link/d/event/?service=${service}&start=${startDate}&end=${endDate}&title=${eventTitle}&timezone=${timezone}&description=${description}`;
                
                dutyLi.innerHTML = `${date.duty}: ${date.day} <a href="${calUrl}" class="link-with-icon"  target="_blank" rel="noopener noreferrer"><span class="material-symbols-rounded">calendar_add_on
                </span></a>`;
                dutiesEl.appendChild(dutyLi);
            }
        });
        
        
        // Préparer un tableau d'événements pour le fichier ICS
        const icsEvents = fiscalDates.map(date => {
            const year = new Date().getFullYear();
            const monthPadded = ('0' + date.month).slice(-2);
            const dayPadded = ('0' + date.day).slice(-2);
            const startDate = `${year}${monthPadded}${dayPadded}T000000`;
            const endDate = `${year}${monthPadded}${dayPadded}T235959`;
            return {
                title: date.duty,
                description: "Date limite pour " + date.duty,
                startDate,
                endDate
            };
        });
        
        const obligations = new Set();

        fiscalDates.forEach(date => {
            // Assurez-vous que les mêmes conditions pour afficher les devoirs dans le calendrier sont appliquées ici
            if (!(status === 'auto-entrepreneur' && caDeclaration === 'non' && date.duty.includes("TVA"))) {
                let dutyType = date.duty.includes("CFE") ? "CFE" : date.duty.split(' ')[0];
                obligations.add(dutyType);
            }
        });

        document.getElementById('calendar').setAttribute('data-obligations', JSON.stringify(Array.from(obligations)));

        updateCalendarInfosDisplay();

        setupDownloadButton(icsEvents);
        calendarEl.appendChild(li);
    }

    // Désactivation des éléments du formulaire et ajustement de l'interface
    ['status', 'tvaFrequency', 'urssafFrequency', 'caSup', 'salaryTaxe'].forEach(id => {
        document.getElementById(id).disabled = true;
    });

    document.getElementById('slider-nav').style.display = 'none';
    document.getElementById('generateCalendar').style.display = 'none';
    document.getElementById('resetButton').style.display = 'block';
}

function getFiscalDates(status, tvaFrequency, urssafFrequency, caSup, salaryTaxe) {
    let dates = [];

    // CFE
    if (status !== 'entreprise') {
        dates.push({ month: 12, day: 31, duty: "Solde CFE" });
    } else {
        dates.push({ month: 6, day: 31, duty: "Acompte CFE" }, { month: 12, day: 31, duty: "Solde CFE" });
    }
    
    // IR pour auto-entreprise
    if (status === 'auto-entreprise') {
        dates.push(
            { month: 2, day: 'Acompte', duty: "IR" },
            { month: 4, day: 'Déclaration', duty: "IR" },
            { month: 5, day: 'Acompte', duty: "IR" },
            { month: 8, day: 'Acompte', duty: "IR" },
            { month: 9, day: 'Solde', duty: "IR" },
            { month: 10, day: 'Solde', duty: "IR" },
            { month: 11, day: 'Solde', duty: "IR" },
            { month: 12, day: 'Solde', duty: "IR" }
        );
    }

    // IS pour entreprise ou société
    if (status === 'entreprise') {
        dates.push(
            { month: 3, day: 15, duty: "IS Acompte #1" },
            { month: 5, day: 15, duty: "IS Solde N-1" },
            { month: 6, day: 15, duty: "IS Acompte #2" },
            { month: 9, day: 15, duty: "IS Acompte #3" },
            { month: 12, day: 15, duty: "IS Acompte #4" }
        );
    }

    // TVA
    addTVADates(dates, tvaFrequency);

    // URSSAF - Adapté pour entreprise et non-entreprise, mensuel ou trimestriel
    addURSSAFDates(dates, urssafFrequency, status);

    // Conditions spécifiques aux entreprises ou sociétés
    if (status === 'entreprise') {
        addEnterpriseSpecificDates(dates, salaryTaxe, tvaFrequency, caSup);
    }

    return dates;
}

function addURSSAFDates(dates, urssafFrequency, status) {
    if (urssafFrequency === 'mensuelle') {
        for (let m = 1; m <= 12; m++) {
            dates.push({ month: m, day: getLastDayOfMonth(m), duty: "URSSAF" });
        }
    } else if (urssafFrequency === 'trimestrielle') {
        dates.push(
            { month: 2, day: 5, duty: "URSSAF" },
            { month: 5, day: 5, duty: "URSSAF" },
            { month: 8, day: 5, duty: "URSSAF" },
            { month: 11, day: 5, duty: "URSSAF" }
        );
    }
}

function addTVADates(dates, tvaFrequency) {
    if (tvaFrequency === 'mensuelle') {
        for (let m = 1; m <= 12; m++) {
            dates.push({ month: m, day: getLastDayOfMonth(m), duty: "TVA" });
        }
    } else if (tvaFrequency === 'trimestrielle') {
        dates.push(
            { month: 1, day: 15, duty: "TVA" },
            { month: 4, day: 15, duty: "TVA" },
            { month: 7, day: 15, duty: "TVA" },
            { month: 10, day: 15, duty: "TVA" }
        );
    } else if (tvaFrequency === 'annuelle') {
        dates.push(
            { month: 5, day: 31, duty: "Solde TVA" },
            { month: 7, day: 31, duty: "Acompte TVA 55%" },
            { month: 12, day: 31, duty: "Acompte TVA 40%" }
        );
    }
}

function addEnterpriseSpecificDates(dates, salaryTaxe, tvaFrequency, caSup) {

    // CVAE
    if (caSup === "oui") { // au lieu de caSup === 'oui'
        dates.push(
            { month: 4, day: 'Paiement', duty: "CVAE < à 1500€" },
            { month: 6, day: 'Acompte #1', duty: "CVAE > à 1500€" },
            { month: 9, day: 'Acompte #2', duty: "CVAE > à 1500€" }
        );
    }

    // Taxe sur les salaires, uniquement si TVA est exonérée
    if (tvaFrequency === "exonere") {
        if (salaryTaxe === 'low') {
            dates.push({ month: 1, day: 15, duty: "Taxe sur les salaires N-1" });
        } else if (salaryTaxe === 'middle') {
            dates.push(
                { month: 1, day: 15, duty: "TS N-1" },
                { month: 4, day: 15, duty: "TS Acompte #1" },
                { month: 7, day: 15, duty: "TS Acompte #2" },
                { month: 10, day: 15, duty: "TS Acompte #3" }
            );
        } else if (salaryTaxe === 'high') {
            for (let m = 1; m <= 12; m++) {
                dates.push({ month: m, day: 15, duty: `TS` });
            }
        }
    }

}

function getMonthName(monthIndex) {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return months[monthIndex - 1];
}

function getLastDayOfMonth(month) {
    const year = new Date().getFullYear(); // Année en cours
    return new Date(year, month, 0).getDate();
}



function downloadICS(events) {
    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//hacksw/handcal//NONSGML v1.0//EN',
        'CALSCALE:GREGORIAN',
        'BEGIN:VTIMEZONE',
        'TZID:Europe/Paris',
        'END:VTIMEZONE',
    ];

    events.forEach(event => {
        icsContent.push(
            'BEGIN:VEVENT',
            `SUMMARY:${event.title}`,
            `DESCRIPTION:${event.description}`,
            `DTSTART;TZID=Europe/Paris:${event.startDate}`,
            `DTEND;TZID=Europe/Paris:${event.endDate}`,
            'END:VEVENT'
        );
    });

    icsContent.push('END:VCALENDAR');

    const icsBlob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const icsUrl = URL.createObjectURL(icsBlob);

    // Créer et cliquer sur un lien pour télécharger
    const link = document.createElement('a');
    link.href = icsUrl;
    link.setAttribute('download', 'calendrier_fiscal.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function () {
    
    // Fonction pour vérifier si le bouton de HubSpot est chargé
    var checkHubSpotLoad = setInterval(function() {
        var hsButton = document.querySelector('.hs-button');
        if (hsButton) {
            clearInterval(checkHubSpotLoad);

            // Cacher le bouton original
            var originalButton = document.getElementById('generateCalendar');
            originalButton.style.display = 'none';

            // Insérer le bouton HubSpot à l'emplacement du bouton original
            originalButton.parentNode.insertBefore(hsButton, originalButton);
        }
    }, 100); // Vérifier toutes les 100 ms
});


function updateCalendarInfosDisplay() {
    const calendar = document.getElementById('calendar');
    const obligations = new Set(JSON.parse(calendar.getAttribute('data-obligations')));

    const infoElements = {
        'URSSAF': document.getElementById('URSSAF'),
        'CFE': document.getElementById('CFE'),
        'TVA': document.getElementById('TVA'),
        'IR': document.getElementById('IR'),
        'CVAE': document.getElementById('CVAE'),
        'IS': document.getElementById('IS'),
        'TS': document.getElementById('TS')
    };

    // Réinitialiser la visibilité pour tous les éléments
    Object.values(infoElements).forEach(el => el.style.display = 'none');

    // Afficher uniquement les obligations pertinentes
    obligations.forEach(obligation => {
        if (infoElements[obligation]) {
            infoElements[obligation].style.display = 'list-item';
        }
    });
}
