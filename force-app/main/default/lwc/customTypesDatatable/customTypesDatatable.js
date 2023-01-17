import LightningDatatable from 'lightning/datatable';
import picklistColumn from './picklistColumn.html';
import picklistText from './picklistText.html'
 
export default class CustomTypesDatatable extends LightningDatatable {
    static customTypes = {
        picklistColumnType: {
            template: picklistText,
            editTemplate: picklistColumn,
            standardCellLayout: true,
            typeAttributes: ['label', 'placeholder', 'options', 'value', 'context', 'variant','name']
        }
    };
}