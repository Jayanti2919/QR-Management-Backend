import { Entity, ObjectIdColumn, Column, ObjectId } from "typeorm";

@Entity("users")
export class User {
    @ObjectIdColumn()
    _id: ObjectId;
    
    @Column({ unique: true })
    username: string;
    
    @Column()
    password: string;
    
    @Column({ default: "user" })
    role: string;
}