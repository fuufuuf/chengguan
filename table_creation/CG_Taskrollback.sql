USE [BMSInspection]
GO

/****** Object:  Table [dbo].[CG_TaskRollBack]    Script Date: 2016/1/26 18:33:17 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[CG_TaskRollBack](
	[TaskNum] [char](10) NULL,
	[RollbackOpter] [char](200) NULL,
	[RollbackDate] [char](20) NULL,
	[RollbackMemo] [char](500) NULL
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO

