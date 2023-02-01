public with sharing class CaseTriggerHandler {
  public CaseTriggerHandler() {
  }

  @testVisible
  private List<Case_update__e> eventListCaseUpdate = new List<Case_update__e>();
  @testVisible
  private List<New_Queue_Case__e> eventListNewQueueCase = new List<New_Queue_Case__e>();

  public void createCaseUpdatePlatformEvent(List<Case> cases, String action) {
    for (Case item : cases) {
      Case_update__e event = new Case_update__e(
        Record_Id__c = item.Id,
        Action__c = action
      );
      eventListCaseUpdate.add(event);
    }
    EventBus.publish(eventListCaseUpdate);
  }

  public void checkQueueAssignment(
    Map<Id, Case> oldCasesMap,
    List<Case> cases
  ) {
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
        eventListNewQueueCase.add(event);
      }
    }
    EventBus.publish(eventListNewQueueCase);
  }
}
