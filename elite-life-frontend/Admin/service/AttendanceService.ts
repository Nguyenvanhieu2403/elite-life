import { http, httpDownload, httpFormData } from "./CommonService";

import authHeader from './AuthHeader';
import { AttendanceModal } from "../types/models/attendance";
class AttendanceService {
    teacher = {
        get(id: number) {
            return http
                .get(`/admin/attendance-teachers/create/${id}`, {
                    headers: authHeader(),
                })
                .then(response => {
                    return response.data;
                });
        },
        getSchedule(scheduleId: number) {
            return http
                .get(`/admin/attendance-teachers/create/${scheduleId}`, {
                    headers: authHeader(),
                })
                .then(response => {
                    return response.data;
                });
        },


        getScheduleResult(classId: number, pageSize: number, pageIndex: number, startDate: string, endDate: string, filters?: {
            name: string,
            username: string,
            dob: string
        }) {
            return http
                .get(`/admin/attendance-teachers/getAttendanceTeachers/${classId}?page=${pageIndex}&limit=${pageSize}&fromDate=${startDate}&toDate=${endDate}&name=${filters?.name || ""}&username=${filters?.username || ""}&dob=${filters?.dob || ""}
            `, {
                    headers: authHeader(),
                })
                .then(response => {
                    return response.data;
                });
        },
        getClass() {
            return http
                .get(`/admin/attendance-teachers/getClass`, {
                    headers: authHeader(),
                })
                .then(response => {
                    return response.data;
                });
        }
    }
    student = {
        get(id: number) {
            return http
                .get(`/admin/attendance-students/create/${id}`, {
                    headers: authHeader(),
                })
                .then(response => {
                    return response.data;
                });
        },
        getSchedule(scheduleId: number) {
            return http
                .get(`/admin/attendance-students/create/${scheduleId}`, {
                    headers: authHeader(),
                })
                .then(response => {
                    return response.data;
                });
        },

        getScheduleResult(classId: number, pageSize: number, pageIndex: number, startDate: string, endDate: string, filters?: {
            name: string,
            username: string,
            dob: string
        }) {
            return http
                .get(`/admin/attendance-students/getAttendanceStudents/${classId}?page=${pageIndex}&limit=${pageSize}&fromDate=${startDate}&toDate=${endDate}&name=${filters?.name || ""}&username=${filters?.username || ""}&dob=${filters?.dob || ""}
            `, {
                    headers: authHeader(),
                })
                .then(response => {
                    return response.data;
                });
        },
        getClass() {
            return http
                .get(`/admin/attendance-students/getClass`, {
                    headers: authHeader(),
                })
                .then(response => {
                    return response.data;
                });
        }
    }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new AttendanceService();
