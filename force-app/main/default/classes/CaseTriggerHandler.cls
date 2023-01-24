public with sharing class CaseTriggerHandler {
  public CaseTriggerHandler() {
  }

  private String action;
  private void createCaseUpdatePlatformEvent(List<Case> cases) {
    List<Case_update__e> events = new List<Case_update__e>();
    for (Case item : cases) {
      Case_update__e event = new Case_update__e(
        Record_Id__c = item.Id,
        Action__c = this.action
      );
      events.add(event);
    }
    EventBus.publish(events);
  }

  private void checkQueueAssignment(
    Map<Id, Case> oldCasesMap,
    List<Case> cases
  ) {
    List<New_Queue_Case__e> events = new List<New_Queue_Case__e>();
    for (Case item : cases) {
      if (
        (oldCasesMap == null ||
        oldCasesMap.get(item.Id).OwnerId != item.OwnerId) &&
        item.OwnerId.getSobjectType() == Schema.Group.getSObjectType()
      ) {
        New_Queue_Case__e event = new New_Queue_Case__e(
          Case_Id__c = item.Id,
          Case_Number__c = item.CaseNumber,
          Queue_Id__c = item.OwnerId
        );
        events.add(event);
      }
    }
    EventBus.publish(events);
  }

  public void handleInsertUpdateAndDelete() {
    if (Trigger.isDelete) {
      action = 'DELETE';
      createCaseUpdatePlatformEvent(Trigger.old);
    }
    if (Trigger.isUpdate) {
      action = 'UPDATE';
      createCaseUpdatePlatformEvent(Trigger.new);
      checkQueueAssignment((Map<Id, Case>) Trigger.oldMap, Trigger.new);
    }
    if (Trigger.isInsert) {
      action = 'INSERT';
      createCaseUpdatePlatformEvent(Trigger.new);
      checkQueueAssignment(null, Trigger.new);
    }
    action = 'ERROR';
  }
}
