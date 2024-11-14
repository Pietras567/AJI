export enum Status {
    NotApproved = "NotApproved", 
    Approved = "Approved", 
    Cancelled = "Cancelled", 
    Executed = "Executed"
}

export class OrderStatus {
    private currentStatus: Status;

    constructor(statusString: string) {
        if (Object.values(Status).includes(statusString as Status)) {
            this.currentStatus = statusString as Status;
        } else {
            throw new Error("Invalid status");
        }
    }

    public getStatus(): Status { 
        return this.currentStatus; 
    } 
    
    public setStatus(newStatus: Status): void { 
        this.currentStatus = newStatus; 
    }
}