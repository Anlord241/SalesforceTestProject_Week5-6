trigger CaseTrigger on Case(after insert, after update, after delete) {
  new CaseTriggerHandler().handleInsertUpdateAndDelete();
}
