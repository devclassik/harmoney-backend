import { Request, Response } from 'express';
import { AppDataSource, CampMeeting, Employee, Room } from '@/database';
import { BaseService } from '../shared/base.service';

export class CampMeetingController {
  private campMeetingRepo = AppDataSource.getRepository(CampMeeting);
  private employeeRepo = AppDataSource.getRepository(Employee);
  private roomRepo = AppDataSource.getRepository(Room);
  private baseService = new BaseService(this.campMeetingRepo);
  private employeeBaseService = new BaseService(this.employeeRepo);
  private roomBaseService = new BaseService(this.roomRepo);

  public create = async (req: Request, res: Response): Promise<Response> => {
    const {
      name,
      agenda,
      startDate,
      endDate,
      attendees: employeeIds,
    } = req.body;

    try {
      const attendees = await this.employeeBaseService.findByIds({
        ids: employeeIds,
        resource: 'employee',
        validate: true,
      });

      await this.baseService.create(
        {
          name,
          agenda,
          startDate,
          endDate,
          attendees,
        },
        res,
      );
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
    } = req.body;
    try {
      const campMeeting = await this.baseService.findById({
        id: meetingId,
        resource: 'CampMeeting',
      });

      let attendees: Employee[];
      if (employeeIds?.length) {
        attendees = await this.employeeBaseService.findByIds({
          ids: employeeIds,
          resource: 'employee',
        });
      }
      const updatedCampMeeting = await this.campMeetingRepo.save({
        ...campMeeting,
        name,
        agenda,
        startDate,
        endDate,
        attendees,
      });

      return this.baseService.updatedResponse(res, updatedCampMeeting);
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
        relations: ['attendees', 'attendees.user'],
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
        relations: ['attendees', 'attendees.user'],
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
        .leftJoinAndSelect('room.campMeeting', 'campMeeting');

      if (meetingId) {
        query.where('campMeeting.id = :meetingId', { meetingId });
      }
      if (!meetingId) {
        query.where('campMeeting.id != NULL');
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
        relations: ['attendees'],
      });
      let room = await this.roomBaseService.findById({
        id: roomId,
        resource: 'Room',
        relations: ['occupants', 'campMeeting'],
      });
      const employee = await this.employeeBaseService.findById({
        id: employeeId,
        resource: 'Employee',
      });

      if (campMeeting.attendees.some((att) => att.id !== employeeId)) {
        return this.baseService.errorResponse(res, {
          message: 'Employee is not an attendee',
          status: 403,
        });
      }

      if (room.occupants.some((oc) => oc.id === employeeId)) {
        return this.baseService.errorResponse(res, {
          message: 'Employee is already an occupant of this room',
          status: 403,
        });
      }

      if (room.capacity <= room.occupants.length) {
        return this.baseService.errorResponse(res, {
          message: 'Room is fully occupied',
          status: 403,
        });
      }

      if (room.campMeeting && room.campMeeting?.id !== meetingId) {
        return this.baseService.errorResponse(res, {
          message: 'Room already belong a camp meeting',
          status: 403,
        });
      }

      room = {
        ...room,
        campMeeting,
        occupants: [...room.occupants, employee],
      };

      await this.roomRepo.save(room);

      return this.baseService.successResponse(res, room);
    } catch (error) {
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
        relations: ['attendees'],
      });
      let room = await this.roomBaseService.findById({
        id: roomId,
        resource: 'CampMeeting',
        relations: ['occupants'],
      });
      await this.employeeBaseService.findById({
        id: employeeId,
        resource: 'CampMeeting',
      });

      if (campMeeting.attendees.some(({ id }) => id !== employeeId)) {
        return this.baseService.errorResponse(res, {
          message: 'Employee is not an attendee',
          status: 403,
        });
      }

      if (room.occupants.some(({ id }) => id !== employeeId)) {
        return this.baseService.errorResponse(res, {
          message: 'Employee is not an occupant of this room',
          status: 403,
        });
      }

      if (room.campMeeting.id !== meetingId) {
        return this.baseService.errorResponse(res, {
          message: 'Room already belong a camp meeting',
          status: 403,
        });
      }

      const newOccupants = room.occupants.filter(({ id }) => id !== employeeId);
      room = {
        ...room,
        campMeeting,
        occupants: newOccupants,
      };

      await this.roomRepo.save(room);

      return this.baseService.successResponse(res, room);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };
}
