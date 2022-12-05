import { LightningElement, wire, api, track } from 'lwc';
import getUserCases from '@salesforce/apex/ServiceCaseQueueService.getUserCases';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { deleteRecord } from 'lightning/uiRecordApi';


import CASE_STATUS_FIELD from '@salesforce/schema/Case.Status';
import PRIORITY_FIELD from '@salesforce/schema/Case.Priority';
import ORIGIN_FIELD from '@salesforce/schema/Case.Origin';

const COLUMNS = [
    {
        label: 'Case Number', fieldName: 'CaseUrl', type: 'url',
        typeAttributes: {
            label: {
                fieldName: 'CaseNumber'
            }
        }
    },
    { label: 'Assignee', fieldName: 'Assignee'},
    { label: 'Case Status', fieldName: CASE_STATUS_FIELD.fieldApiName, editable: true},
    { label: 'Priority', fieldName: PRIORITY_FIELD.fieldApiName},
    { label: 'Origin', fieldName: ORIGIN_FIELD.fieldApiName}
];

export default class ServiceCaseQueueFiltered extends LightningElement {
    columns = COLUMNS;
    @track cases;
    @track casesResponse;
    selectedRecord;

    saveDraftValues = [];
 
    @track isLoaded = false;

    @wire(getUserCases)
    casesData(result) {
        this.casesResponse = result;
        this.isLoaded = false;
        this.cases = null;
      
        if (result.data) {
            this.cases = JSON.parse(JSON.stringify(result.data));
            this.cases.forEach(item => item['CaseUrl'] = '/lightning/r/Case/' + item['Id'] + '/view');
            this.cases.forEach(item => item['Assignee'] = item['Owner']['Username']);
            this.isLoaded = true;
        } 
        if (result.error) {
            this.cases = undefined;
        }
    };

    handleSave(event) {
        this.saveDraftValues = event.detail.draftValues;
        const recordInputs = event.detail.draftValues.slice().map(draft => {
            const fields = JSON.parse(JSON.stringify(draft));
            return { fields };
        });
        console.log(recordInputs);

        Promise.all(recordInputs.map(recordInput => updateRecord(recordInput))).then(res => {
            this.ShowToast('Success', 'Successful update!', 'success', 'dismissable');
            this.saveDraftValues = [];
            return this.refresh()
        }).catch(error => {
            this.ShowToast('Error', 'Fatal error!', 'error', 'dismissable');
        }).finally(() => {
            this.saveDraftValues = [];
        });
    }
 
    ShowToast(title, message, variant, mode) {
        const evt = new ShowToastEvent({
                title: title,
                message:message,
                variant: variant,
                mode: mode
            });
            this.dispatchEvent(evt);
    }

    refresh() {
       refreshApex(this.casesResponse);
    }
}