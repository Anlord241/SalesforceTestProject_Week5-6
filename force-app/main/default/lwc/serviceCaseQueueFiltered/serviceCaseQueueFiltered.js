import { LightningElement, wire, api, track } from "lwc";
import getUserCases from "@salesforce/apex/ServiceCaseQueueService.getUserCases";
import { updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";

import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import CASE_OBJECT from "@salesforce/schema/Case";
import CASE_STATUS_FIELD from "@salesforce/schema/Case.Status";
import PRIORITY_FIELD from "@salesforce/schema/Case.Priority";
import ORIGIN_FIELD from "@salesforce/schema/Case.Origin";

const COLUMNS = [
  {
    label: "Case Number",
    fieldName: "CaseUrl",
    type: "url",
    typeAttributes: {
      label: {
        fieldName: "CaseNumber"
      }
    }
  },
  { label: "Assignee", fieldName: "Assignee" },
  {
    label: "Case Status",
    fieldName: CASE_STATUS_FIELD.fieldApiName,
    type: "customPicklist",
    editable: true,
    typeAttributes: {
      options: { fieldName: "picklistOptions" },
      value: { fieldName: "Status" },
      placeholder: "Choose Status"
    }
  },
  { label: "Priority", fieldName: PRIORITY_FIELD.fieldApiName },
  { label: "Origin", fieldName: ORIGIN_FIELD.fieldApiName, editable: true }
];

export default class ServiceCaseQueueFiltered extends LightningElement {
  columns = COLUMNS;
  @track cases;
  selectedRecord;

  saveDraftValues = [];
  @track picklistOptions = [];

  @track isLoaded = false;

  @wire(getObjectInfo, { objectApiName: CASE_OBJECT })
  caseObjectMetadata;

  @wire(getPicklistValues, {
    recordTypeId: "$caseObjectMetadata.data.defaultRecordTypeId",
    fieldApiName: CASE_STATUS_FIELD
  })
  сasesStatusPicklist({ data, error }) {
    console.log(data);
    console.log(error);
    if (data) {
      this.picklistOptions = data.values;
      console.log(1111111111111);
      console.log(this.picklistOptions);
      console.log(data.values);
    } else if (error) {
      console.log("error");
    }
  }

  @wire(getUserCases, {picklist: "$picklistOptions" })
  casesData(result) {
    console.log(this.picklistOptions);
    console.log("asasasasasasasasa");
    if (result.data) {
      this.cases = JSON.parse(JSON.stringify(result.data));
      console.log(this.cases);
      console.log("___________________");
      
      this.cases.forEach((element) => {
        element.picklistOptions = this.picklistOptions;
      });
      console.log("_________________");
      console.log(this.cases);
      this.picklistOptions.forEach((a) => console.log(a));
      this.cases.forEach(
        (item) =>
          (item["CaseUrl"] = "/lightning/r/Case/" + item["Id"] + "/view")
      );
      this.cases.forEach(
        (item) => (item["Assignee"] = item["Owner"]["Username"])
      );
      this.isLoaded = true;
    }
  }

  handleSave(event) {
    this.saveDraftValues = event.detail.draftValues;
    const recordInputs = event.detail.draftValues.slice().map((draft) => {
      const fields = JSON.parse(JSON.stringify(draft));
      return { fields };
    });
    console.log(recordInputs);
    this.isLoaded = true;
    Promise.all(recordInputs.map((recordInput) => updateRecord(recordInput)))
      .then((res) => {
        this.ShowToast(
          "Success",
          "Successful update!",
          "success",
          "dismissable"
        );
        this.saveDraftValues = [];
        return this.refresh();
      })
      .catch((error) => {
        this.ShowToast("Error", "Fatal error!", "error", "dismissable");
      })
      .finally(() => {
        this.saveDraftValues = [];
      });
  }

  ShowToast(title, message, variant, mode) {
    const evt = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant,
      mode: mode
    });
    this.dispatchEvent(evt);
  }

  refreshPage() {
    this.isLoaded = false;
    setTimeout(() => {
      this.refresh();
      this.isLoaded = true;
    }, 100);
  }

  refresh() {
    refreshApex(this.cases);
  }
}
