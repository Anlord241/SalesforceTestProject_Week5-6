public with sharing class ServiceCaseQueueService {
  @AuraEnabled(cacheable=true)
  public static List<Case> getUserCases() {
    String currentUserId = UserInfo.getUserId();
    return [
      SELECT
        CaseNumber,
        Owner.Username,
        Status,
        Priority,
        Origin,
        CreatedDate,
        Type
      FROM Case
      WHERE OwnerId = :currentUserId OR CreatedById = :currentUserId
      ORDER BY Priority ASC, CreatedDate DESC, OwnerId DESC
      LIMIT 5
    ];
  }
}
