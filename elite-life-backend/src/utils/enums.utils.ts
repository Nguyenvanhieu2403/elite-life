
export enum OtherListTypeEnums {
    TeacherType = "TeacherType",
    AttendanceStatus = "AttendanceStatus",
    LearnDate = "LearnDate",
    ScheduleType = "ScheduleType",
    ForeignAffairsLocation = "ForeignAffairsLocation",
    ForeignAffairsTeam = "ForeignAffairsTeam",
    LanguageDegree = "LanguageDegree",
    StudentGroups = "StudentGroups",
    PartnerType = "PartnerType",
    NationType = "NationType",
    StudyStatusType = "StudyStatusType",
    StudentsTemporaryType = "StudentsTemporaryType"
}

export enum AccessTypeEnums {
    LogIn = "LogIn",
    LogOut = "LogOut",
    ChangePassword = "ChangePassword",
    ResetPassword = "ResetPassword"
}

export enum ApplicationTypeEnums {
    User = "User",
    Sale = "Sale",
}

export enum FileTypeEnums {
    User = 1,
    Sale = 2,
}

export enum OrderTypeEnums {
    First = 1,
    Last = 2,
    Total = 3
}

export enum OrderStatusEnums {
    Doing = 2,
    Done = 3,
    Final = 4
}

export enum DecisionStatusEnums {
    Waiting = "Waiting",
    Approve = "Approve",
    Reject = "Reject"
}

export enum ForeignAffairsPersonsStatusEnums {
    On = "On",
    Off = "Off"
}

export enum ForeignAffairsOrderStatusEnums {
    Init = "Init",
    Waiting = "Waiting",
    Approve = "Approve",
    Reject = "Reject",
    Deleted = "Deleted"
}

export enum PayrollCommissionTypeEnums {
    HHTrucTiep = 1,
    HHGianTiep = 2,
    HHGioiThieu = 3,
    Khac = 4
}

export enum RequestTypeEnums {
    userInfo = "userInfo",
    collaboratorInfo = "collaboratorInfo",
    permissions = "permissions",
}


export enum FilterMatchModeEnums {
    Contains = "contains",
    Equals = "equals",
    Lt = "lt",
    Lte = "lte",
    Gt = "gt",
    Gte = "gte",
    DateIs = "dateIs",
    DateBefore = "dateBefore",
    DateAfter = "dateAfter",
    In = "in",
}

export enum StudentInterviewStatusEnums {
    UnSent = "0",
    WaitInterview1 = "1",
    RejectInterview = "2",
    WaitInterview2 = "3",
    WaitContract = "4",
    Done = "5",
    Flew = "6"
}

export enum StudentStatusEnums {
    Advise = "0", //Tư vấn
    ClosingMoney = "1", // Chốt tiền
    InsertCode = "2",// Nhập mã 
    ArrangeClass = "3",// Xếp lớp
    Train = "4", // Đào tạo
    Interview = "5", //Phỏng vấn 
    WaitContract = "6", // Chờ HĐ
    ApplyingVisa = "7",//Làm visa
    Flew = "8" //Bay
}
export enum GatewayForeignGatewayEnums {
    GatewayOrderAdd = "GatewayOrderAdd", // thêm đơn hàng
    GatewayOrderApprove = "GatewayOrderApprove", // duyệt đơn hàng
    GatewayOrderReject = "GatewayOrderReject", // từ chối đơn hàng
    GatewayStudentOrderAdd = "GatewayStudentOrderAdd", // thêm học viên vào đơn hàng
    GatewayStudentOrderUpdate = "GatewayStudentOrderUpdate", // chỉnh sửa thông tin về lịch pv của học viên trong 1 đơn hàng
    ExpirationDateB1 = "ExpirationDateB1"
}

export enum AttendanceTeachersEnums {
    Attended = "Attended",
    NoAttended = "NoAttended",
    NoAttendedYet = "NoAttendedYet"
}
export enum ServiceContractEnums {
    Unpaid = "Unpaid", //chưa thanh toán
    PartialPayment = "PartialPayment", //đã thanh toán 1 phần
    CompletlyPayment = "CompletlyPayment", //thanh toán đầy đủ
    Finished = "Finished", //đã hoàn tất (bay + đóng hợp đồng)
    Cancel = "Cancel",  //hủy hợp đồng
    ContractLiquidation = "ContractLiquidation" //thanh lý hợp đồng
}

export enum TransferStatusEnums {
    Transferred = "Transferred",  //đã chuyển
    NotTransferred = "NotTransferred" //chưa chuyển
}


export enum ScheduleTypeEnums {
    Study = "Study", //học
    Test = "Test",  //kiểm tra
    Exam = "Exam"   //thi
}

export enum ApproveKYCTypeEnums {
    Waiting = "Waiting",
    Approve = "Approve",
    Reject = "Reject"
}

export enum KYCTypeEnums {
    AutoKYC = "AutoKYC",
    ManualKyc = "ManualKyc"
}


export enum WalletTypeEnums {
    Source = "Source",
    CustomerShare = "CustomerShare",
    CustomerGratitude = "CustomerGratitude",
    Sale1 = "Sale1",
    Sale2 = "Sale2",
    Sale3 = "Sale3",
}

export enum WithdrawalStatusEnums {
    Processing = "Processing",
    Sent = "Sent",
    Rejected = "Rejected"
}

export enum RankEnums {
    None = "None",
    V = "V",
    V1 = "V1",
    V2 = "V2",
    V3 = "V3",
    V4 = "V4",
    V5 = "V5",
}