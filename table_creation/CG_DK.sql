USE [BMSInspection]
GO

/****** Object:  Table [dbo].[CG_DK]    Script Date: 2016/1/26 18:29:34 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[CG_DK](
	[UserID] [varchar](50) NOT NULL,
	[TaskID] [varchar](200) NOT NULL,
	[Task_Create_Time] [varchar](20) NOT NULL,
	[Task_Check_Label] [int] NOT NULL
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO

ALTER TABLE [dbo].[CG_DK] ADD  CONSTRAINT [DF_CG_DK_Task_Check_Label]  DEFAULT ((0)) FOR [Task_Check_Label]
GO

