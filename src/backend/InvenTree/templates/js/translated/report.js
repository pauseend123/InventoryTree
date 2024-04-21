{% load i18n %}

/* globals
    attachSelect,
    closeModal,
    inventreeGet,
    openModal,
    makeOptionsList,
    modalEnable,
    modalSetContent,
    modalSetTitle,
    modalSubmit,
    showAlertDialog,
*/

/* exported
    printReports,
*/

/**
 * Present the user with the available reports,
 * and allow them to select which report to print.
 *
 * The intent is that the available report templates have been requested
 * (via AJAX) from the server.
 */
function selectReport(reports, items, options={}) {

    // If there is only a single report available, just print!
    if (reports.length == 1) {
        if (options.success) {
            options.success(reports[0].pk);
        }

        return;
    }

    var modal = options.modal || '#modal-form';

    var report_list = makeOptionsList(
        reports,
        function(item) {
            var text = item.name;

            if (item.description) {
                text += ` - ${item.description}`;
            }

            return text;
        },
        function(item) {
            return item.pk;
        }
    );

    // Construct form
    var html = '';

    if (items.length > 0) {

        html += `
        <div class='alert alert-block alert-info'>
        ${items.length} {% trans "items selected" %}
        </div>`;
    }

    html += `
    <form method='post' action='' class='js-modal-form' enctype='multipart/form-data'>
        <div class='form-group'>
            <label class='control-label requiredField' for='id_report'>
            {% trans "Select Report Template" %}
            </label>
            <div class='controls'>
                <select id='id_report' class='select form-control name='report'>
                    ${report_list}
                </select>
            </div>
        </div>
    </form>`;

    openModal({
        modal: modal,
    });

    modalEnable(modal, true);
    modalSetTitle(modal, '{% trans "Select Test Report Template" %}');
    modalSetContent(modal, html);

    attachSelect(modal);

    modalSubmit(modal, function() {

        var label = $(modal).find('#id_report');

        var pk = label.val();

        closeModal(modal);

        if (options.success) {
            options.success(pk);
        }
    });

}


/*
 * Print report(s) for the selected items:
 *
 * - Retrieve a list of matching report templates from the server
 * - Present the available templates to the user (if more than one available)
 * - Request printed document
 *
 * Required options:
 * - model_type: The "type" of report template to print against
 * - items: The list of objects to print
 */
function printReports(model_type, items) {

    if (!items || items.length == 0) {
        showAlertDialog(
            '{% trans "Select Items" %}',
            '{% trans "No items selected for printing" %}',
        );
        return;
    }

    // Join the items with a 'query safe' comma character
    const item_string = items.join(',');

    let params = {
        enabled: true,
        model_type: model_type,
        items: item_string,
    };

    // Request a list of available report templates
    inventreeGet('{% url "api-report-template-list" %}', params, {
        success: function(response) {
            if (response.length == 0) {
                showAlertDialog(
                    '{% trans "No Reports Found" %}',
                    '{% trans "No report templates found which match the selected items" %}',
                );
                return;
            }

            // Select report template for printing
            selectReport(response, items, {
                success: function(pk) {
                    let href = `{% url "api-report-template-list" %}${pk}/print/?items=${item_string}`;

                    window.open(href);
                }
            });
        }
    });
}
