CREATE TABLE `lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`schedule_id` text,
	`original_lesson_id` text,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`duration` integer NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `makeup_original_unique` ON `lessons` (`original_lesson_id`);--> statement-breakpoint
CREATE INDEX `lesson_date_idx` ON `lessons` (`date`);--> statement-breakpoint
CREATE INDEX `lesson_student_idx` ON `lessons` (`student_id`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`month` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`due_date` text NOT NULL,
	`paid_at` text,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_student_month` ON `payments` (`student_id`,`month`);--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`time` text NOT NULL,
	`duration` integer NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`instrument` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`package_name` text NOT NULL,
	`lessons_per_month` integer NOT NULL,
	`price_cents` integer NOT NULL,
	`due_day` integer NOT NULL,
	`start_date` text NOT NULL,
	`created_at` text NOT NULL
);
