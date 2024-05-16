/*!
 * Ce script est protégé par les droits d'auteur © LIVEMENTOR, 2024.
 * Tous droits réservés.
 * 
 * Ce script et toutes ses parties sont la propriété intellectuelle de LIVEMENTOR.
 * Toute reproduction, distribution ou utilisation non autorisée est strictement interdite.
 * 
 * Si vous souhaitez utiliser ce script ou une partie de celui-ci, veuillez obtenir une autorisation préalable
 * en contactant LIVEMENTOR.
 * 
 * LIVEMENTOR ne peut être tenu responsable de toute utilisation de ce script
 * sans autorisation.
 */

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
    const foreignWorkers = document.getElementById('foreignWorkers').value;
    const employeeCount = document.getElementById('employeeCount').value;
    const salaryTaxe = document.getElementById('SalaryTaxe').value;

    document.getElementById('calendarContainer').style.display = 'block';
    document.getElementById('resetButton').style.display = 'flex';
    document.getElementById('slider').style.display = 'none';

    const calendarEl = document.getElementById('calendar');
    calendarEl.innerHTML = '';

    // Récupérer toutes les dates fiscales
    let fiscalDates = getFiscalDates(status, tvaFrequency, urssafFrequency, caSup, foreignWorkers, employeeCount, salaryTaxe, caDeclaration);

    // Trier les dates par mois et jour
    fiscalDates.sort((a, b) => {
        if (a.month === b.month) {
            return a.day - b.day;
        }
        return a.month - b.month;
    });

    // Créer une liste pour chaque mois
    let currentMonth = 0;
    let dutiesEl;

    fiscalDates.forEach(date => {
        if (date.month !== currentMonth) {
            currentMonth = date.month;
            const li = document.createElement('li');
            li.innerHTML = `<strong>${getMonthName(currentMonth)}</strong><ul class="fiscal-duties"></ul>`;
            dutiesEl = li.querySelector('.fiscal-duties');
            calendarEl.appendChild(li);
        }

        if (!(status === 'auto-entrepreneur' && caDeclaration === 'non' && date.duty.includes("TVA"))) {
            const dutyLi = document.createElement('li');
            // Ajout de l'attribut data-duty ici
            dutyLi.setAttribute('data-duty', date.duty.split(' ')[0]); // Extrait le premier mot comme URSSAF, CFE, etc.

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

            dutyLi.innerHTML = `${date.duty}: ${date.day} <a href="${calUrl}" class="link-with-icon" target="_blank" rel="noopener noreferrer"><span class="material-symbols-rounded">calendar_add_on</span></a>`;
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
}


function getFiscalDates(status, tvaFrequency, urssafFrequency, caSup, foreignWorkers, employeeCount, salaryTaxe) {
    let dates = [];

    // CFE
    if (status !== 'entreprise') {  
        dates.push({ month: 5, day: 31, duty: "CFE Acompte " }, { month: 12, day: 15, duty: "CFE solde " }); 
    } else {
        dates.push({ month: 5, day: 31, duty: "CFE Acompte " }, { month: 12, day: 15, duty: "CFE solde " }); 
    }
    
    // IR pour auto-entreprise
    if (status === 'auto-entrepreneur') {
        dates.push(
            { month: 2, day: 'acompte', duty: "IR " },
            { month: 4, day: 'déclaration', duty: "IR " },
            { month: 5, day: 'acompte', duty: "IR " },
            { month: 8, day: 'acompte', duty: "IR " },
            { month: 9, day: 'solde', duty: "IR " },
            { month: 10, day: 'solde', duty: "IR " },
            { month: 11, day: 'solde', duty: "IR " },
            { month: 12, day: 'solde', duty: "IR " }
        );
    }

    // IS pour entreprise ou société
    if (status === 'entreprise') {
        dates.push(
            { month: 3, day: 15, duty: "IS acompte #1 " },
            { month: 5, day: 15, duty: "IS solde N-1 " },
            { month: 6, day: 15, duty: "IS acompte #2 " },
            { month: 9, day: 15, duty: "IS acompte #3 " },
            { month: 12, day: 15, duty: "IS acompte #4 " }
        );
    }

    // TVA
    addTVADates(dates, tvaFrequency, status);

    // URSSAF - Adapté pour entreprise et non-entreprise, mensuel ou trimestriel
    addURSSAFDates(dates, urssafFrequency, status);

    // Conditions spécifiques aux entreprises ou sociétés
    if (status === 'entreprise') {
        addEnterpriseSpecificDates(dates, salaryTaxe, tvaFrequency, caSup, foreignWorkers, employeeCount);
    }

    return dates;
}

function addURSSAFDates(dates, urssafFrequency, status) {
    if (urssafFrequency === 'mensuelle') {
        for (let m = 1; m <= 12; m++) {
            dates.push({ month: m, day: getLastDayOfMonth(m), duty: "URSSAF " });
        }
    } else if (urssafFrequency === 'trimestrielle') {
        dates.push(
            { month: 2, day: getLastDayOfMonth(2), duty: "URSSAF " },
            { month: 5, day: getLastDayOfMonth(5), duty: "URSSAF " },
            { month: 8, day: getLastDayOfMonth(8), duty: "URSSAF " },
            { month: 11, day: getLastDayOfMonth(11), duty: "URSSAF " }
        );
    }
}

function addTVADates(dates, tvaFrequency, status) {
    if (tvaFrequency === 'mensuelle') {
        for (let m = 1; m <= 12; m++) {
            // Choisir le jour en fonction du statut de l'entreprise
            const day = status === 'entreprise' ? 15 : getLastDayOfMonth(m);
            dates.push({ month: m, day: day, duty: "TVA règlement " });
        }
    } else if (tvaFrequency === 'trimestrielle') {
        dates.push(
            { month: 1, day: 15, duty: "TVA règlement " },
            { month: 4, day: 15, duty: "TVA règlement " },
            { month: 7, day: 15, duty: "TVA règlement " },
            { month: 10, day: 15, duty: "TVA règlement " }
        );
    } else if (tvaFrequency === 'annuelle') {
        dates.push(
            { month: 5, day: 31, duty: "TVA solde " },
            { month: 7, day: 31, duty: "TVA acompte 55% " },
            { month: 12, day: 31, duty: "TVA acompte 40% " }
        );
    }
}

function addEnterpriseSpecificDates(dates, salaryTaxe, tvaFrequency, caSup, foreignWorkers, employeeCount) {

    // CVAE
    if (caSup === "oui") {
        dates.push(
            { month: 5, day: '1', duty: "CVAE < à 1 500€ - Paiement " },
            { month: 6, day: '15', duty: "CVAE > à 1 500€ - Acompte #1 " },
            { month: 9, day: '15', duty: "CVAE > à 1 500€ - Acompte #2 " }
        );
    }

    // Taxe travailleurs étrangers
    if (foreignWorkers === "oui") {
        dates.push(
            { month: 2, day: '15', duty: "OFII " }
        );
    }

    // OETH et PEEC
    if (employeeCount === 'more20') {
        dates.push(
            { month: 5, day: 5, duty: "OETH " }
        );
    } else if (employeeCount === 'more50') {
        dates.push(
            { month: 5, day: 5, duty: "OETH " },
            { month: 5, day: 2, duty: "PEEC " }
        );
    } 

    // Taxe sur les salaires, uniquement si TVA est exonérée
    if (salaryTaxe === 'low') {
        dates.push({ month: 1, day: 15, duty: "TS N-1 - Solde " });
    } else if (salaryTaxe === 'middle') {
        dates.push(
            { month: 1, day: 15, duty: "TS N-1 " },
            { month: 4, day: 15, duty: "TS acompte #1 " },
            { month: 7, day: 15, duty: "TS acompte #2 " },
            { month: 10, day: 15, duty: "TS acompte #3 " }
        );
    } else if (salaryTaxe === 'high') {
        for (let m = 1; m <= 12; m++) {
            dates.push({ month: m, day: 15, duty: `TS ` });
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
        'TS': document.getElementById('TS'),
        'OETH': document.getElementById('OETH'), // Ajouté pour OETH
        'PEEC': document.getElementById('PEEC'), // Ajouté pour PEEC
        'OFII': document.getElementById('OFII')  // Ajouté pour OFII si applicable
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
