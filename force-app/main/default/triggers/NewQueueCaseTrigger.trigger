trigger NewQueueCaseTrigger on New_Queue_Case__e(after insert) {
  for (New_Queue_Case__e item : Trigger.new) {
    Messaging.CustomNotification notification = new Messaging.CustomNotification();

    String body =
      'New Case ' +
      item.Case_Number__c +
      ' is available. Direct link: ' +
      URL.getSalesforceBaseUrl().toExternalForm() +
      '/lightning/r/Case/' +
      item.Case_Id__c +
      '/view . Case inbox: ' +
      URL.getSalesforceBaseUrl().toExternalForm() +
      '/lightning/page/home';
    notification.setBody(body);
    notification.setTitle('New case available!');
    CustomNotificationType type = [
      SELECT Id
      FROM CustomNotificationType
      WHERE DeveloperName = 'New_Case_Available'
    ];

    notification.setNotificationTypeId(type.id);
    notification.setTargetId(item.Case_Id__c);
    notification.send(new Set<String>{ '0052w00000BQwTiAAL' });
  }
}
