import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Iter "mo:core/Iter";
import Array "mo:core/Array";

import Float "mo:core/Float";
import Nat "mo:core/Nat";


actor {
  public type Portfolio = {
    indianEquity : Float;
    usStocks : Float;
    pf : Float;
    nps : Float;
    gold : Float;
    fd : Float;
    mutualFunds : Float;
    dividends : Float;
    interest : Float;
    homeLoan : Float;
    rsu : Float;
    esop : Float;
  };

  public type RsusOrEsop = {
    stockName : Text;
    quantity : Float;
    rate : Float;
  };

  public type MonthlySnapshot = {
    year : Nat;
    month : Nat; // 1-12
    // Assets
    indianEquity : Float;
    usStocks : Float;
    pf : Float;
    nps : Float;
    fd : Float;
    mutualFunds : Float;
    rsu : RsusOrEsop;
    esop : RsusOrEsop;
    // Precious metals
    goldGrams : Float;
    goldRate : Float;
    silverGrams : Float;
    silverRate : Float;
    // Liabilities
    homeLoan : Float;
    // Passive income
    dividends : Float;
    interest : Float;
  };

  public type UserProfile = {
    name : Text;
  };

  var defaultPortfolio : Portfolio = {
    indianEquity = 0.0;
    usStocks = 0.0;
    pf = 0.0;
    nps = 0.0;
    gold = 0.0;
    fd = 0.0;
    mutualFunds = 0.0;
    dividends = 0.0;
    interest = 0.0;
    homeLoan = 0.0;
    rsu = 0.0;
    esop = 0.0;
  };

  let portfolios = Map.empty<Principal, Portfolio>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let monthlySnapshots = Map.empty<Principal, List.List<MonthlySnapshot>>();
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getPortfolio() : async Portfolio {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view portfolio");
    };
    switch (portfolios.get(caller)) {
      case (null) { defaultPortfolio };
      case (?portfolio) { portfolio };
    };
  };

  public shared ({ caller }) func updatePortfolio(portfolio : Portfolio) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update portfolio");
    };
    portfolios.add(caller, portfolio);
  };

  public query ({ caller }) func getDashboard() : async {
    totalAssets : Float;
    totalLiabilities : Float;
    netWorth : Float;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard");
    };
    let portfolio = switch (portfolios.get(caller)) {
      case (null) { defaultPortfolio };
      case (?p) { p };
    };

    let totalAssets = portfolio.indianEquity + portfolio.usStocks + portfolio.pf + portfolio.nps + portfolio.gold + portfolio.fd + portfolio.mutualFunds + portfolio.dividends + portfolio.interest + portfolio.rsu + portfolio.esop;
    let totalLiabilities = portfolio.homeLoan;
    let netWorth = totalAssets - totalLiabilities;

    {
      totalAssets;
      totalLiabilities;
      netWorth;
    };
  };

  public query ({ caller }) func isAuthenticated() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #user);
  };

  // Monthly Snapshot Functions
  public shared ({ caller }) func saveMonthlySnapshot(snapshot : MonthlySnapshot) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save snapshots");
    };

    let updatedSnapshots = switch (monthlySnapshots.get(caller)) {
      case (null) {
        let newList = List.empty<MonthlySnapshot>();
        newList.add(snapshot);
        newList;
      };
      case (?snapshots) {
        let filtered = snapshots.filter(
          func(s) {
            not (s.year == snapshot.year and s.month == snapshot.month);
          }
        );
        filtered.add(snapshot);
        filtered;
      };
    };

    monthlySnapshots.add(caller, updatedSnapshots);
  };

  public query ({ caller }) func getMonthlySnapshots() : async [MonthlySnapshot] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view snapshots");
    };

    switch (monthlySnapshots.get(caller)) {
      case (null) { [] };
      case (?snapshots) {
        snapshots.toArray();
      };
    };
  };
};

