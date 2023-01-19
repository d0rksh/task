# Task (You tell, I do)

# React & Node.js(Express)

## Running Frontend 

```
npm run dev 
```

## Running Backend

```
npm run start
```

## Database Schema

user table

```
CREATE TABLE `users` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `email` VARCHAR(200) NOT NULL,
  `password` TEXT NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'MASTER' ,
  CONSTRAINT `PRIMARY` PRIMARY KEY (`id`, `email`),
  CONSTRAINT `email_unq` UNIQUE (`email`)
);

```

answer table

```
CREATE TABLE `answers` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `question_id` INT NOT NULL,
  `my_answer` INT NOT NULL,
  `user_id` INT NOT NULL,
  CONSTRAINT `PRIMARY` PRIMARY KEY (`id`)
);


```

question table

```

CREATE TABLE `questions` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `question` TEXT NOT NULL,
  `answer` INT NOT NULL,
  CONSTRAINT `PRIMARY` PRIMARY KEY (`id`)
);


```
