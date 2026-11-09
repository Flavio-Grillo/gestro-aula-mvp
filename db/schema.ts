import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
export const students = sqliteTable('students', {
  id:text('id').primaryKey(), name:text('name').notNull(), instrument:text('instrument').notNull(), phone:text('phone').notNull().default(''),
  packageName:text('package_name').notNull(), lessonsPerMonth:integer('lessons_per_month').notNull(), priceCents:integer('price_cents').notNull(), dueDay:integer('due_day').notNull(),
  startDate:text('start_date').notNull(), createdAt:text('created_at').notNull()
});
export const schedules = sqliteTable('schedules', {
  id:text('id').primaryKey(), studentId:text('student_id').notNull().references(()=>students.id), startDate:text('start_date').notNull(), endDate:text('end_date'),
  time:text('time').notNull(), duration:integer('duration').notNull()
});
export const lessons = sqliteTable('lessons', {
  id:text('id').primaryKey(), studentId:text('student_id').notNull().references(()=>students.id), scheduleId:text('schedule_id').references(()=>schedules.id),
  originalLessonId:text('original_lesson_id'), date:text('date').notNull(), time:text('time').notNull(), duration:integer('duration').notNull(),
  status:text('status').notNull().default('scheduled'), notes:text('notes').notNull().default('')
},table=>[uniqueIndex('makeup_original_unique').on(table.originalLessonId),index('lesson_date_idx').on(table.date),index('lesson_student_idx').on(table.studentId)]);
export const payments = sqliteTable('payments', {
  id:text('id').primaryKey(), studentId:text('student_id').notNull().references(()=>students.id), month:text('month').notNull(), amountCents:integer('amount_cents').notNull(),
  dueDate:text('due_date').notNull(), paidAt:text('paid_at')
},table=>[uniqueIndex('payment_student_month').on(table.studentId,table.month)]);
