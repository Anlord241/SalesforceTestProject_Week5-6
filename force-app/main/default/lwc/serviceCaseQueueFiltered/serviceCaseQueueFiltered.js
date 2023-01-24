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
import {
  subscribe,
  unsubscribe,
  onError,
  setDebugFlag,
  isEmpEnabled
} from "lightning/empApi";

const COLUMNS = [
  {
    label: "",
    fieldName: "Index"
  },
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
    label: "Status",
    fieldName: STATUS_FIELD.fieldApiName,
    type: "picklistColumnType",
    typeAttributes: {
      options: { fieldName: "pickListOptions" },
      value: { fieldName: STATUS_FIELD.fieldApiName },
      placeholder: "Choose Status",
      context: { fieldName: "Id" }
    }
  },
  { label: "Priority", fieldName: PRIORITY_FIELD.fieldApiName, editable: true },
  { label: "Origin", fieldName: ORIGIN_FIELD.fieldApiName }
];

export default class ServiceCaseQueueFiltered extends LightningElement {
  channelName = "/event/Case_update__e";

  connectedCallback() {
    const update = this.refreshPage;

    subscribe(this.channelName, -1, this.refreshPage).then((response) => {
      console.log(
        "Subscription request sent to: ",
        JSON.stringify(response.channel)
      );
    });
    this.registerErrorListener();
  }
  registerErrorListener() {
    onError((error) => {
      console.log("Received error from server: ", JSON.stringify(error));
    });
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////

  columns = COLUMNS;
  @track data = [];
  draftValues;

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
    this.draftValues = new Map();
    this.casesData = result;
    if (result.data) {
      this.data = JSON.parse(JSON.stringify(result.data));
      this.data.forEach((element) => {
        element.pickListOptions = this.pickListOptions;
      });
      this.data.forEach((item) => this.draftValues.set(item.Id, item.Status));
      this.data.forEach(
        (item) =>
          (item["CaseUrl"] = "/lightning/r/Case/" + item["Id"] + "/view")
      );
      let index = 1;
      this.data.forEach((item) => (item["Index"] = index++));
      this.data.forEach(
        (item) => (item["Assignee"] = item["Owner"]["Username"])
      );
      this.isLoaded = true;
    }
  }

  handleComboboxChange(event) {
    event.target.parentElement.classList.add("value-changed");
    this.draftValues.set(event.target.uniqueKey, event.detail.value);
  }

  handleSave(event) {
    let recordInputs = this.data.slice().map((draft) => {
      let fields = JSON.parse(JSON.stringify(draft, ["Id", "Status"]));
      return { fields };
    });
    recordInputs.forEach(
      (item) =>
        (item["fields"]["Status"] = this.draftValues.get(item["fields"]["Id"]))
    );

    this.isLoaded = true;
    Promise.all(recordInputs.map((recordInput) => updateRecord(recordInput)))
      .then((res) => {
        this.ShowToast(
          "Success",
          "Successful update!",
          "success",
          "dismissable"
        );

        return this.refreshPage();
      })
      .catch((error) => {
        console.log(error);
        this.ShowToast(
          "FATAL ERROR!!!",
          error.body.output.errors[0].message,
          "error",
          "dismissable"
        );
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
    console.log("hi2");
    this.isLoaded = false;
    refreshApex(this.casesData);
    refreshApex(this.data);

    setTimeout(() => {
      this.refresh();
      this.isLoaded = true;
    }, 100);
  }

  refresh() {
    this.draftValues = new Map();
    refreshApex(this.casesData);
  }
}
