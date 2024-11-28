import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

@Entity('qr-codes') // MongoDB collection name
export class QrCode {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  userId: string;

  @Column()
  type: 'static' | 'dynamic';

  @Column()
  url: string;

  @Column({ default: null })
  dynamicId: string;

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
