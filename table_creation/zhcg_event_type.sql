--------------------------------------------------------
--  文件已创建 - 星期二-六月-28-2016   
--------------------------------------------------------
--------------------------------------------------------
--  DDL for Table FI_ZHCGEVENTTYPE
--------------------------------------------------------




   CREATE TABLE "BMSInspection"."dbo"."CG_ZHCGEVENTTYPE"
      (
      "EVENTTYPEID" VARCHAR(38),
   	"EVENTTYPECODE" VARCHAR(200),
   	"EVENTTYPENAME" VARCHAR(200),
   	"UNIQUECODE" VARCHAR(200)
      )

      Insert into "BMSInspection"."dbo"."CG_ZHCGEVENTTYPE" (EVENTTYPEID,EVENTTYPECODE,EVENTTYPENAME,UNIQUECODE) values (1,'1','事件','1');
      Insert into "BMSInspection"."dbo"."CG_ZHCGEVENTTYPE" (EVENTTYPEID,EVENTTYPECODE,EVENTTYPENAME,UNIQUECODE) values (2,'2','部件','2');