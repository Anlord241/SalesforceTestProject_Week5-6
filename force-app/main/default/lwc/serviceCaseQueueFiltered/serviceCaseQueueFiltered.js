import { LightningElement, wire, track } from "lwc";
import getUserCases from "@salesforce/apex/ServiceCaseQueueService.getUserCases";
import { updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import CASE_OBJECT from "@salesforce/schema/Case";
import STATUS_FIELD from "@salesforce/schema/Case.Status";
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
  { label: "Assignee", fieldName: "Assignee"},
  {
    label: "Status",
    editable: true,
    fieldName: STATUS_FIELD.fieldApiName,
    wrapText: true,
    type: "picklistColumnType",
    typeAttributes: {
      options: { fieldName: "pickListOptions" },
      value: { fieldName: STATUS_FIELD.fieldApiName },
      placeholder: "Choose Status",
      context: { fieldName: "Id" }
    }
  },
  { label: "Priority", fieldName: PRIORITY_FIELD.fieldApiName},
  { label: "Origin", fieldName: ORIGIN_FIELD.fieldApiName}
];

export default class ServiceCaseQueueFiltered extends LightningElement {
  columns = COLUMNS;
  @track data = [];
  @track draftValues = [];
  @track casesData;
  @track pickListOptions;

  @track isLoaded = false;

  @wire(getObjectInfo, { objectApiName: CASE_OBJECT })
  objectInfo;

  @wire(getPicklistValues, {
    recordTypeId: "$objectInfo.data.defaultRecordTypeId",
    fieldApiName: STATUS_FIELD
  })
  сasesStatusPicklist({ error, data }) {
    if (data) {
      this.pickListOptions = data.values;
    } else if (error) {
      console.log(error);
    }
  }

  @wire(getUserCases, { pickList: "$pickListOptions" })
  casesData(result) {
    this.casesData = result;
    if (result.data) {
      this.data = JSON.parse(JSON.stringify(result.data));
      this.data.forEach((element) => {
        element.pickListOptions = this.pickListOptions;
      });
      this.data.forEach(
        (item) =>
          (item["CaseUrl"] = "/lightning/r/Case/" + item["Id"] + "/view")
      );
      this.data.forEach(
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
        this.ShowToast("Error", "FATAL ERROR!", "error", "dismissable");
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
    refreshApex(this.casesData);
  }
}
