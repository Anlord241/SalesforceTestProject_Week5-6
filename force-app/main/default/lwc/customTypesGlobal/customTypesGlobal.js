import LightningDatatable from 'lightning/datatable';
import customPicklist from './customPicklist.html';
import customPicklistStatic from './customPicklistStatic.html';


export default class CustomTypesGlobal extends LightningDatatable {
    static customTypes = {
        customPicklist: {
            template: customPicklistStatic,
            editTemplate: customPicklist,
            standartCellLayout: true,
            typeAttributes: ['label', 'value', 'placeholder', 'options']
        }
    }
}