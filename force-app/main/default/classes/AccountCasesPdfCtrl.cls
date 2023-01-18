public without sharing class AccountCasesPdfCtrl {
  public List<Case> getAccountCasesPrevWeek() {
    List<Case> toReturn = [
      SELECT
        Account.Name,
        Account.Owner.Name,
        Account.Id,
        CaseNumber,
        Status,
        Priority,
        Origin
      FROM Case
      WHERE CreatedDate = LAST_MONTH
      ORDER BY Account.Id ASC
    ];
    return toReturn;
  }
}
