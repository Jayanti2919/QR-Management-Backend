import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

@Entity('events')
export class Event {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  qrId: string;

  @Column()
  timestamp: Date;

  @Column()
  location: string;

  @Column()
  device: string;

  @Column()
  platform: string;

  @Column()
  ip: string;

  @Column()
  url: string;
}
