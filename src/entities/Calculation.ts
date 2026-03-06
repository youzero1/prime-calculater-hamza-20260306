import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('calculations')
export class Calculation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  type!: string;

  @Column({ type: 'text' })
  input!: string;

  @Column({ type: 'text' })
  result!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
