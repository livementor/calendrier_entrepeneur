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

$(document).ready(function(){
    $('#slider').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        dots: false,
        infinite: false
    });


    // Masquer les boutons "Suivant" et "Précédent" lors du clic sur "Générer Calendrier"
    $('#generateCalendar').click(function() {
        $('.slider-buttons').hide(); // Masque la div contenant les boutons
        // Optionnel: inclure ici la logique pour générer le calendrier
    });


    // Ajout de la logique pour basculer entre "Générer" et "Recommencer"
    $('#generateCalendar').click(function() {
        // Logique de génération du calendrier ici (peut-être déjà dans une autre fonction)
        $('#generateCalendar').hide();
        $('#resetButton').show();
    });

    $('#resetButton').click(function() {
        // Logique pour réinitialiser l'application
        $('#resetButton').hide();
        $('#generateCalendar').show();
        // Réinitialiser le formulaire et le calendrier ici
        // Réactiver les champs de formulaire désactivés lors de la génération
        $('#slider').slick('slickGoTo', 0); // Retourne au premier slide
        adjustSlides(); // Ajuste les slides pour l'état initial
        updateSummary(); // Met à jour le résumé pour l'état initial
    });

    function adjustTvaFrequencyOptions(status, activityType) {
        var selectedValue = $('#tvaFrequency').val();
    
        // Supprimer les options conditionnelles
        $("#tvaFrequency option[value='annuelle']").remove();
        $("#tvaFrequency option[value='exonere']").remove();
    
        // Ajouter les options en fonction du statut et du type d'activité
        if (status !== 'auto-entrepreneur') {
            $("#tvaFrequency").append($('<option>', {
                value: 'annuelle',
                text: 'Annuelle'
            }));
            $("#tvaFrequency").append($('<option>', {
                value: 'exonere',
                text: 'Exonéré'
            }));
        } else if (status === 'auto-entrepreneur') {
            // Permettre l'option annuelle pour les auto-entrepreneurs qui vendent des marchandises
            $("#tvaFrequency").append($('<option>', {
                value: 'annuelle',
                text: 'Annuelle'
            }));
        }
    
        // Restaurer la sélection après avoir modifié les options, si l'option existe
        if ($("#tvaFrequency option[value='" + selectedValue + "']").length > 0) {
            $('#tvaFrequency').val(selectedValue);
        } else {
            // Si la valeur sélectionnée précédemment n'existe plus, définir une valeur par défaut
            $('#tvaFrequency').val('mensuelle');  // Choisir une option par défaut adaptée
        }
    }
    

    function updateTvaInfoText() {
        var selectedOption = $('#tvaFrequency').val();
        var status = $('#status').val();
        var infoText = "";
    
        if (status === "entreprise") {
            if (selectedOption === "exonere") {
                infoText = "Dans le cas où votre société est exonéré.e de TVA, pensez à bien faire figurer la mention suivante sur vos factures : « TVA non applicable - article 293 B du CGI » (Code général des impôts).";
            } else {
                infoText = "Le rythme et la date exacte de dépôt de la déclaration sont indiqués dans l'espace professionnel impots.gouv.fr de chaque entreprise. Vous pouvez également solliciter votre expert-comptable pour les connaître.";
            }
        } else if (status === "auto-entrepreneur") {
            infoText = "Le rythme de déclaration et paiement de votre TVA a été défini à la création de votre entreprise. Si vous ne le connaissez pas, vous pouvez solliciter votre expert-comptable ou consulter votre memento fiscal, un document administratif qui vous a été communiqué par votre SIE.";
        }
    
        $('#tvaFrequencySlide .form-info p').text(infoText);
    }
    
    $('#tvaFrequency').change(updateTvaInfoText);
    $('#status').change(updateTvaInfoText);
    

    function adjustSlides() {
        // Condition pour "activityTypeSlide"
        const status = $('#status').val();
        const employeeCount = $('#employeeCount').val();
        const tvaFrequency = $('#tvaFrequency').val();

        console.log("Status:", status, "Employee Count:", employeeCount, "TVA Frequency:", tvaFrequency); // Pour le diagnostic

        // Ajuster les options de "tvaFrequency" en fonction du statut
        adjustTvaFrequencyOptions(status, activityType);

        // Appel de la mise à jour du texte de la TVA
        updateTvaInfoText();
    
        // Affichage conditionnel de la slide "activityTypeSlide"
        if (status === 'auto-entrepreneur') {
            $('#activityTypeSlide').show();
        } else {
            $('#activityTypeSlide').hide();
        }
    
        // Mise à jour du texte de "caDeclarationLabel" en fonction de "activityType"
        $('#activityType').change(function() {
            const activityType = $(this).val();
            
            if (activityType === 'goods') {
                $('#caDeclarationLabel').text("Je réalise un CA de plus de 101 000€ sur l'année civile*:");
            } else if (activityType === 'service') {
                $('#caDeclarationLabel').text("Je réalise un CA de plus de 39 100€ sur l'année civile*:");
            }
        }).change();


        // Gestion de l'affichage de la slide "employeeQuestionSlide"
        if (status === 'entreprise') {
            $('#employeeQuestionSlide').show();
        } else {
            $('#employeeQuestionSlide').hide();
        }

        // Gestion de l'affichage de la slide "SalaryTaxeSlide"
        if (tvaFrequency === 'exonere') {
            $('#SalaryTaxeSlide').show();
        } else {
            $('#SalaryTaxeSlide').hide();
        }

        // Gestion de l'affichage de la slide "foreignWorkersQuestionSlide"
        if (employeeCount !== 'none') {
            $('#foreignWorkersQuestionSlide').show();
        } else {
            $('#foreignWorkersQuestionSlide').hide();
        }
        
        // Ajout de la condition pour masquer "caDeclarationSlide" pour le statut "entreprise"
        if (status === 'entreprise') {
            $('#caDeclarationSlide').hide();
        } else {
            $('#caDeclarationSlide').show();
        }
    
        // Condition pour "caSupSlide"
        if (status === 'entreprise') {
            $('#caSupSlide').show();
        } else {
            $('#caSupSlide').hide();
        } 
    }
 
    $('#status, #employeeCount').change(function() {
        console.log("Change detected for:", this.id, "New value:", $(this).val());
        adjustSlides();
    });


    function checkTvaFrequencySlideVisibility() {
        const status = $('#status').val();
        const caDeclaration = $('#caDeclaration').val();

        if ((status === 'auto-entrepreneur' && caDeclaration === 'oui') || status === 'entreprise') {
            $('#tvaFrequencySlide').show();
        } else {
            $('#tvaFrequencySlide').hide();
        }
    }

    // Attacher l'événement change à la fois à #status et #caDeclaration
    $('#status, #caDeclaration').change(function() {
        checkTvaFrequencySlideVisibility();
    });   


    
    // Mise à jour du résumé basé sur les sélections actuelles
    function updateSummary() {
        const status = $('#status').val();
        const activityType = $('#activityType').val();
        const caDeclaration = $('#caDeclaration').val(); // Toujours récupéré mais utilisé uniquement pour certaines conditions
        const tvaFrequency = $('#tvaFrequency').val();
        const employeeCount = $('#employeeCount').val();
        const urssafFrequency = $('#urssafFrequency').val();
        const caSup = $('#caSup').val();
        const salaryTaxe = $('#SalaryTaxe').val();
        const foreignWorkers = $('#foreignWorkers').val();
    
        let summaryText = `Statut : ${status}<br>`;
    
        // Inclure le type d'activité uniquement pour le statut 'auto-entrepreneur'
        if (status === 'auto-entrepreneur') {
            summaryText += `Type d'activité : ${activityType === 'service' ? 'Prestation de service' : 'Vente de marchandises'}<br>`;
        }
    
        // Conditionnellement inclure la fréquence TVA basé sur caDeclaration pour auto-entrepreneur
        if (!(status === 'auto-entrepreneur' && caDeclaration === 'non')) {
            summaryText += `Fréquence TVA : ${tvaFrequency}<br>`;
        }
    
        // Inclure la fréquence URSSAF pour tous les statuts
        summaryText += `Fréquence URSSAF : ${urssafFrequency}<br>`;
    
        // Conditions spécifiques aux entreprises
        if (status === 'entreprise') {
            summaryText += `Nombre d'employés : ${convertEmployeeCountToText(employeeCount)}<br>`;
            summaryText += `Taxe sur les salaires : ${convertSalaryTaxeToText(salaryTaxe)}<br>`;
            summaryText += `Emploie des travailleurs étrangers : ${foreignWorkers === 'oui' ? 'Oui' : 'Non'}<br>`;    
            summaryText += `CA supérieur à 152 500€ : ${caSup === 'oui' ? 'oui' : 'non'}<br>`;
            if (tvaFrequency === 'exonere') {
                let salaryTaxeText = convertSalaryTaxeToText(salaryTaxe); // Convertir la valeur en texte compréhensible
                summaryText += `Taxe sur les salaires : ${salaryTaxeText}<br>`;
            }
        }
    
        $('#summary').html(summaryText);
    }

    function convertSalaryTaxeToText(salaryTaxe) {
        switch (salaryTaxe) {
            case 'low':
                return "moins de 4 000€";
            case 'middle':
                return "entre 4 000€ et 10 000€";
            case 'high':
                return "plus de 10 000€";
            default:
                return "non spécifié"; // Par défaut si la valeur n'est pas reconnue
        }
    }
    function convertEmployeeCountToText(employeeCount) {
        switch (employeeCount) {
            case 'none':
                return "pas de salarié";
            case 'less20':
                return "moins de 20 salariés";
            case 'more50':
                return "plus de 50 salariés";
            default:
                return "non spécifié"; // Par défaut si la valeur n'est pas reconnue
        }
    }

    // Appel de updateSummary pour les changements de sélection incluant tous les champs pertinents
    $('#status, #tvaFrequency, #urssafFrequency, #caSup, #caValue, #SalaryTaxe, #employeeCount, #foreignWorkers').change(function() {
        adjustSlides(); // Ajuste les slides en fonction des sélections actuelles
        updateSummary(); // Met à jour le résumé basé sur les sélections actuelles
    });

    // Initialisation des slides et mise à jour du résumé au chargement
    adjustSlides();
    checkTvaFrequencySlideVisibility();
    updateSummary();

    // Les fonctions pour gérer les clics sur les boutons next et prev
    $('.nextBtn').click(function(){
        $('#slider').slick('slickNext');
    });

    $('.prevBtn').click(function(){
        $('#slider').slick('slickPrev');
    });
});