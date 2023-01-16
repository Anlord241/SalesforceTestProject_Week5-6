public inherited sharing class ServiceCaseQueueService {
  @AuraEnabled(Cacheable=true)
  public static List<Case> getUserCases() {
    String currentUserId = UserInfo.getUserId();
    return [
      SELECT CaseNumber, Owner.Username, Status, Priority, Origin, CreatedDate
      FROM Case
      WHERE OwnerId = :currentUserId OR CreatedById = :currentUserId
      ORDER BY Priority ASC, CreatedDate DESC, OwnerId DESC
      LIMIT 25
    ];
  }
}
