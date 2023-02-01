trigger CaseTrigger on Case(after insert, after update, after delete) {
  String action;
  CaseTriggerHandler cth = new CaseTriggerHandler();
  if (Trigger.isDelete) {
    action = 'DELETE';
    cth.createCaseUpdatePlatformEvent(Trigger.old, action);
  }
  if (Trigger.isUpdate) {
    action = 'UPDATE';
    cth.createCaseUpdatePlatformEvent(Trigger.new, action);
    cth.checkQueueAssignment((Map<Id, Case>) Trigger.oldMap, Trigger.new);
  }
  if (Trigger.isInsert) {
    action = 'INSERT';
    cth.createCaseUpdatePlatformEvent(Trigger.new, action);
    cth.checkQueueAssignment(null, Trigger.new);
  }
}
