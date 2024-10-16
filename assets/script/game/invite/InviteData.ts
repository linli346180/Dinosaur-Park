import * as exp from "constants";


export class InviteDataList {
    userInviteDetail: InviteData[] = [];
}

export interface InviteData {
    inviteeUserName : string;
    avatarUrl:string;
    inviteeUserInviteNum:number;
}

