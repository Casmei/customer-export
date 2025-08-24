import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  brand: string;

  @Column({ length: 150 })
  model: string;

  @Column({ length: 100, nullable: true })
  version?: string;

  @Column()
  year: number;

  @Column({ length: 50 })
  color: string;

  @Column({ length: 50 })
  fuel: string;

  @Column()
  doors: number;

  @Column()
  km: number;

  @Column()
  price: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
