export class Utils {
  public static MainAccount: string;
  public static IsMining: boolean = false;
  public static Status: "Mining" | "Syncing" | "Running" | "Stoped" = "Stoped";
  public static Hashrate: number = 0;
  public static randomString(len) {
    len = len || 32;
    const $chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
    const maxPos = $chars.length;
    let pwd = "";
    for (let i = 0; i < len; i++) {
      pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
  }
  public static GetReadableBalance(b16balance) {
    var balance = parseInt(b16balance, 16);
    return balance / 1e18;
  }
  public static IsNullOrEmpty(s) {
    return s === null || s === undefined || s === "";
  }
}
