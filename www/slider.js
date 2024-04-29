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


    function adjustTvaFrequencyOptions(status) {
        // Conserver la valeur sélectionnée avant de modifier les options
        var selectedValue = $('#tvaFrequency').val();
    
        // Supprimer les options conditionnelles
        $("#tvaFrequency option[value='annuelle']").remove();
        $("#tvaFrequency option[value='exonere']").remove();
    
        // Ajouter les options en fonction du statut
        if (status !== 'auto-entrepreneur') {
            $("#tvaFrequency").append($('<option>', {
                value: 'annuelle',
                text: 'Annuelle'
            }));
            $("#tvaFrequency").append($('<option>', {
                value: 'exonere',
                text: 'Exonéré'
            }));
        }
    
        // Restaurer la sélection après avoir modifié les options, si l'option existe
        if ($("#tvaFrequency option[value='" + selectedValue + "']").length > 0) {
            $('#tvaFrequency').val(selectedValue);
        } else {
            // Si la valeur sélectionnée précédemment n'existe plus, vous pourriez vouloir définir une valeur par défaut
            $('#tvaFrequency').val(/* valeur par défaut, par exemple 'mensuelle' ou 'trimestrielle' */);
        }
    }

    function adjustSlides() {
        // Condition pour "activityTypeSlide"
        const status = $('#status').val();
    
        // Ajuster les options de "tvaFrequency" en fonction du statut
        adjustTvaFrequencyOptions(status);
    
        // Affichage conditionnel de la slide "activityTypeSlide"
        if (status === 'auto-entrepreneur') {
            $('#activityTypeSlide').show();
        } else {
            $('#activityTypeSlide').hide();
        }
    
        // Mise à jour du texte de "caDeclarationLabel" en fonction de "activityType"
        $('#activityType').change(function() {
            console.log("Changement détecté.");
            const activityType = $(this).val();
            console.log("Type d'activité:", activityType);
            
            if (activityType === 'goods') {
                $('#caDeclarationLabel').text("Je réalise un CA de plus de 101 000€ sur l'année civile*:");
            } else if (activityType === 'service') {
                $('#caDeclarationLabel').text("Je réalise un CA de plus de 39 100€ sur l'année civile*:");
            }
        }).change();
        
    
    
        // Ajout de la condition pour masquer "caDeclarationSlide" pour le statut "entreprise"
        if (status === 'entreprise') {
            $('#caDeclarationSlide').hide();
        } else {
            $('#caDeclarationSlide').show();
        }
    
        // Condition pour "SalaryTaxeSlide"
        const tvaFrequency = $('#tvaFrequency').val();
        if (tvaFrequency === 'exonere') {
            $('#SalaryTaxeSlide').show();
        } else {
            $('#SalaryTaxeSlide').hide();
        }
    
        // Condition pour "caSupSlide"
        if (status === 'entreprise') {
            $('#caSupSlide').show();
        } else {
            $('#caSupSlide').hide();
        } 
    }
 
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
        const urssafFrequency = $('#urssafFrequency').val();
        const caSup = $('#caSup').val();
        const salaryTaxe = $('#SalaryTaxe').val();
    
        let summaryText = `Statut : ${status}<br>`;
    
        // Ajoutez votre nouveau gestionnaire d'événements ici
        $('#tvaFrequency').change(function() {
            var selectedOption = $(this).val();
            var infoText = "";

            if (selectedOption === "exonere") {
                infoText = "Dans le cas où votre société est exonéré.e de TVA, pensez à bien faire figurer la mention suivante sur vos factures : « TVA non applicable - article 293 B du CGI » (Code général des impôts).";
            } else {
                infoText = "Le rythme de déclaration et paiement de votre TVA a été défini à la création de votre entreprise. Si vous ne le connaissez pas, vous pouvez solliciter votre expert-comptable ou consulter votre memento fiscal, un document administratif qui vous a été communiqué par votre SIE.";
            }

            // Mettez à jour le texte dans <p> sous .form-info pour la slide tvaFrequencySlide
            $('#tvaFrequencySlide .form-info p').text(infoText);
        });


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
            summaryText += `CA supérieur à 152 500€ : ${caSup === 'oui' ? 'Oui' : 'Non'}<br>`;
            if (tvaFrequency === 'exonere') {
                // Adapter cette partie si nécessaire pour convertir les valeurs de salaryTaxe en texte compréhensible
                let salaryTaxeText = salaryTaxe; // Vous pourriez vouloir convertir cette valeur en texte plus clair
                summaryText += `Taxe sur les salaires : ${salaryTaxeText}<br>`;
            }
        }
    
        $('#summary').html(summaryText);
    }
    
    

    // Appel de updateSummary pour les changements de sélection
    $('#status, #tvaFrequency, #urssafFrequency, #caSup, #caValue').change(function() {
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