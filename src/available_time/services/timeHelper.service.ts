import { Injectable } from "@nestjs/common";

@Injectable()
export class TimeHelper{
     isValidTimeFormat(time: string): boolean {
        // Matches HH:MM-HH:MM (e.g., 09:00-10:00)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
      }
      
     isDateInPast(date: Date): boolean {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate < today;
      }
}


