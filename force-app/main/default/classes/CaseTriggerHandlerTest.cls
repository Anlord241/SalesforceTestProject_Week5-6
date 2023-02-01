@isTest
private class CaseTriggerHandlerTest {
  private static final String ACTION = 'UPDATE';

  @future
  private static void createQueueSObject(Id queueId) {
    List<Case> cases = new List<Case>();

    for (Integer i = 0; i < 2; i++) {
      cases.add(new Case(Origin = 'Web', OwnerId = queueId));
    }
    insert cases;
  }

  @testSetup
  static void setup() {
    Group g = new Group(Type = 'Queue', Name = 'Queue name');
    insert g;
    QueueSObject q = new QueueSObject(SobjectType = 'Case', QueueId = g.Id);
    insert q;
    createQueueSObject(g.Id);
  }

  @isTest
  static void createCaseUpdatePlatformEventTest() {
    List<Case> cases = [SELECT Id FROM Case];
    CaseTriggerHandler cth = new CaseTriggerHandler();
    cth.createCaseUpdatePlatformEvent(cases, ACTION);
    System.assert(cth.eventListCaseUpdate.size() == cases.size());
    for (Case_update__e event : cth.eventListCaseUpdate) {
      System.assertEquals(ACTION, event.Action__c);
    }
  }

  @isTest
  static void checkQueueAssignmentTest() {
    List<Case> cases = [SELECT Id, CaseNumber, OwnerId FROM Case];

    CaseTriggerHandler cth = new CaseTriggerHandler();
    cth.checkQueueAssignment(null, cases);
    System.assert(cth.eventListNewQueueCase.size() == cases.size());
  }
}
