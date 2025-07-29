import { Request, Response } from 'express';
import { AppDataSource, CampMeeting, Employee, Room, CampMeetingAttendee } from '@/database';
import { BaseService } from '../shared/base.service';
import { StatusCodes } from 'http-status-codes';

export class CampMeetingController {
  private campMeetingRepo = AppDataSource.getRepository(CampMeeting);
  private employeeRepo = AppDataSource.getRepository(Employee);
  private roomRepo = AppDataSource.getRepository(Room);
  private campMeetingAttendeeRepo = AppDataSource.getRepository(CampMeetingAttendee);
  private baseService = new BaseService(this.campMeetingRepo);
  private employeeBaseService = new BaseService(this.employeeRepo);
  private roomBaseService = new BaseService(this.roomRepo);
  private attendeeBaseService = new BaseService(this.campMeetingAttendeeRepo);

  public create = async (req: Request, res: Response): Promise<Response> => {
    const {
      name,
      agenda,
      startDate,
      endDate,
      attendees: employeeIds,
      documents
    } = req.body;

    try {
      const employees = await this.employeeBaseService.findByIds({
        ids: employeeIds,
        resource: 'employee',
        validate: true,
      });

      // Create camp meeting first
      const campMeeting = await this.campMeetingRepo.save({
        name,
        agenda,
        startDate,
        endDate,
        documents
      });

      // Create attendee records
      const attendeeRecords = employees.map(employee => ({
        campMeeting,
        employee,
      }));

      await this.campMeetingAttendeeRepo.save(attendeeRecords);

      const createdMeeting = await this.campMeetingRepo.findOne({
        where: { id: campMeeting.id },
        relations: ['attendees', 'attendees.employee'],
      });

      return this.baseService.successResponse(res, createdMeeting);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public update = async (req: Request, res: Response): Promise<Response> => {
    const meetingId = Number(req.params.meetingId);
    const {
      name,
      agenda,
      startDate,
      endDate,
      attendees: employeeIds,
      documents,
    } = req.body;
    try {
      const campMeeting = await this.baseService.findById({
        id: meetingId,
        resource: 'CampMeeting',
      });

      // Update camp meeting basic info
      const updatedCampMeeting = await this.campMeetingRepo.save({
        ...campMeeting,
        name,
        agenda,
        startDate,
        endDate,
        documents,
      });

      // Update attendees if provided
      if (employeeIds?.length) {
        // Fetch existing attendees
        const existingAttendees = await this.campMeetingAttendeeRepo.find({
          where: { campMeeting: { id: meetingId } },
          relations: ['employee'],
        });
        const existingEmployeeIds = new Set(existingAttendees.map(a => a.employee.id));

        // Only add new unique employee IDs, ensuring they are numbers
        const uniqueNewEmployeeIds: number[] = [...new Set(employeeIds)]
          .map(id => Number(id))
          .filter(id => !isNaN(id) && !existingEmployeeIds.has(id));
        const newEmployees = await this.employeeBaseService.findByIds({
          ids: uniqueNewEmployeeIds,
          resource: 'employee',
        });

        const newAttendeeRecords = newEmployees.map(employee => ({
          campMeeting: updatedCampMeeting,
          employee,
        }));

        await this.campMeetingAttendeeRepo.save(newAttendeeRecords);

        // Optionally, remove attendees not in the new list:
        // const toRemove = existingAttendees.filter(a => !employeeIds.includes(a.employee.id));
        // if (toRemove.length > 0) {
        //   await this.campMeetingAttendeeRepo.remove(toRemove);
        // }
      }
      const result = await this.campMeetingRepo.findOne({
        where: { id: updatedCampMeeting.id },
        relations: ['attendees', 'attendees.employee'],
      });

      return this.baseService.updatedResponse(res, result);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public get = async (req: Request, res: Response): Promise<Response> => {
    const meetingId = Number(req.params.meetingId);

    try {
      const campMeeting = await this.baseService.findById({
        id: meetingId,
        resource: 'CampMeeting',
        relations: ['attendees', 'attendees.employee', 'attendees.employee.user', 'attendees.assignedRoom'],
      });

      return this.baseService.successResponse(res, campMeeting);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      await this.baseService.findAll({
        res,
        relations: ['attendees', 'attendees.employee', 'attendees.employee.user', 'attendees.assignedRoom'],
      });
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    const meetingId = Number(req.params.meetingId);

    try {
      await this.baseService.delete({
        id: meetingId,
        resource: 'CampMeeting',
        res,
      });
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public getAllAttendee = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const meetingId = req.params.meetingId
      ? Number(req.params.meetingId)
      : null;
    try {
      console.log(meetingId);

      const query = this.employeeRepo
        .createQueryBuilder('employee')
        .leftJoinAndSelect('employee.campRooms', 'room')
        .leftJoinAndSelect('room.accommodation', 'accommodation')
        .leftJoinAndSelect('employee.campMeetingAttendances', 'attendance')
        .leftJoinAndSelect('attendance.campMeeting', 'campMeeting')
        .leftJoinAndSelect('attendance.assignedRoom', 'assignedRoom');

      if (meetingId) {
        query.where('campMeeting.id = :meetingId', { meetingId });
      }
      if (!meetingId) {
        query.where('campMeeting.id IS NOT NULL');
      }

      const attendees = await query.getMany();

      console.log(query.getSql());

      return this.baseService.successResponse(res, attendees);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public assignRoom = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { meetingId, roomId, employeeId } = req.body;
    try {
      const campMeeting = await this.baseService.findById({
        id: meetingId,
        resource: 'CampMeeting',
        relations: ['attendees', 'attendees.employee'],
      });

      console.log("CampMeeting found:", campMeeting);


      const room = await this.roomBaseService.findById({
        id: roomId,
        resource: 'Room',
        relations: ['occupants', 'campMeeting'],
      });
      console.log("Room found:", room);

      const employee = await this.employeeBaseService.findById({
        id: employeeId,
        resource: 'Employee',
      });

      console.log("Employee found:", employee);

      // Check if employee is an attendee
      const isAttendee = campMeeting.attendees.some(
        (att) => att.employee.id === employeeId
      );
      console.log("Is employee an attendee?", isAttendee);

      if (!isAttendee) {
        return this.baseService.errorResponse(res, {
          message: 'Employee is not an attendee',
          status: 403,
        });
      }

      // Check if employee is already assigned to a room
      const existingAssignment = await this.campMeetingAttendeeRepo.findOne({
        where: {
          campMeeting: { id: meetingId },
          employee: { id: employeeId },
        },
        relations: ['assignedRoom'],
      });

      console.log("Existing assignment:", existingAssignment);


      if (existingAssignment?.assignedRoom) {
        return this.baseService.errorResponse(res, {
          message: 'Employee is already assigned to a room',
          status: 403,
        });
      }

      // Check room capacity
      const currentOccupants = await this.campMeetingAttendeeRepo.count({
        where: { assignedRoom: { id: roomId } },
      });

      console.log("Room current occupants:", currentOccupants, "Capacity:", room.capacity);

      if (room.capacity && currentOccupants >= room.capacity) {
        console.log("Room is fully occupied.");

        return this.baseService.errorResponse(res, {
          message: 'Room is fully occupied',
          status: 403,
        });
      }

      // Check if room belongs to the same camp meeting
      if (room.campMeeting && room.campMeeting.id !== meetingId) {
        console.log("Room belongs to a different camp meeting.");

        return this.baseService.errorResponse(res, {
          message: 'Room already belongs to a different camp meeting',
          status: 403,
        });
      }

      // Update or create attendee record with room assignment
      if (existingAssignment) {
        console.log("Updating existing attendee record with room assignment...");

        existingAssignment.assignedRoom = room;
        await this.campMeetingAttendeeRepo.save(existingAssignment);
      } else {
        console.log("Creating new attendee record with room assignment...");

        await this.campMeetingAttendeeRepo.save({
          campMeeting,
          employee,
          assignedRoom: room,
        });
      }

      console.log("Room assigned successfully.");

      return this.baseService.successResponse(res, { message: 'Room assigned successfully' });
    } catch (error) {
      console.error("Unhandled error in assignRoom:", error);

      return this.baseService.errorResponse(res, error);
    }
  };

  public unassignRoom = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { meetingId, roomId, employeeId } = req.body;
    try {
      const campMeeting = await this.baseService.findById({
        id: meetingId,
        resource: 'CampMeeting',
        relations: ['attendees', 'attendees.employee'],
      });

      const room = await this.roomBaseService.findById({
        id: roomId,
        resource: 'Room',
        relations: ['campMeeting'],
      });

      const employee = await this.employeeBaseService.findById({
        id: employeeId,
        resource: 'Employee',
      });

      // Check if employee is an attendee
      const isAttendee = campMeeting.attendees.some(
        (att) => att.employee.id === employeeId
      );
      if (!isAttendee) {
        return this.baseService.errorResponse(res, {
          message: 'Employee is not an attendee',
          status: 403,
        });
      }

      // Check if room belongs to the same camp meeting
      if (room.campMeeting && room.campMeeting.id !== meetingId) {
        return this.baseService.errorResponse(res, {
          message: 'Room belongs to a different camp meeting',
          status: 403,
        });
      }

      // Remove room assignment
      const attendeeRecord = await this.campMeetingAttendeeRepo.findOne({
        where: {
          campMeeting: { id: meetingId },
          employee: { id: employeeId },
          assignedRoom: { id: roomId },
        },
      });

      if (!attendeeRecord) {
        return this.baseService.errorResponse(res, {
          message: 'Employee is not assigned to this room',
          status: 403,
        });
      }

      attendeeRecord.assignedRoom = null;
      await this.campMeetingAttendeeRepo.save(attendeeRecord);

      return this.baseService.successResponse(res, { message: 'Room unassigned successfully' });
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public checkUserAttendance = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { userId } = req.params;
    const meetingId = req.params.meetingId ? Number(req.params.meetingId) : null;

    try {
      // Find the employee associated with the user ID
      const employee = await this.employeeRepo.findOne({
        where: { user: { id: Number(userId) } },
        relations: ['user'],
      });

      if (!employee) {
        return this.baseService.errorResponse(res, {
          message: 'User not found',
          status: StatusCodes.NOT_FOUND,
        });
      }

      // If meetingId is provided, check attendance for that specific meeting
      if (meetingId) {
        const attendance = await this.campMeetingAttendeeRepo.findOne({
          where: {
            campMeeting: { id: meetingId },
            employee: { id: employee.id },
          },
          relations: ['campMeeting', 'assignedRoom'],
        });

        if (!attendance) {
          return this.baseService.successResponse(res, {
            isAttendee: false,
            employee: {
              id: employee.id,
              firstName: employee.firstName,
              lastName: employee.lastName,
              middleName: employee.middleName,
              profferedName: employee.profferedName,
            },
          });
        }

        return this.baseService.successResponse(res, {
          isAttendee: true,
          employee: {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            middleName: employee.middleName,
            profferedName: employee.profferedName,
          },
          campMeeting: {
            id: attendance.campMeeting.id,
            name: attendance.campMeeting.name,
          },
          assignedRoom: attendance.assignedRoom ? {
            id: attendance.assignedRoom.id,
            name: attendance.assignedRoom.name,
          } : null,
        });
      }

      // If no meetingId provided, check if user is an attendee of any camp meeting
      const attendances = await this.campMeetingAttendeeRepo.find({
        where: { employee: { id: employee.id } },
        relations: ['campMeeting', 'assignedRoom'],
      });

      return this.baseService.successResponse(res, {
        isAttendee: attendances.length > 0,
        employee: {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          middleName: employee.middleName,
          profferedName: employee.profferedName,
        },
        attendedMeetings: attendances.map((attendance) => ({
          id: attendance.campMeeting.id,
          name: attendance.campMeeting.name,
          assignedRoom: attendance.assignedRoom ? {
            id: attendance.assignedRoom.id,
            name: attendance.assignedRoom.name,
          } : null,
        })),
      });
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };
}
