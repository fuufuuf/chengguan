USE [BMSInspection]
GO

/****** Object:  Table [dbo].[CG_ApplyAccredit]    Script Date: 2016/1/26 18:29:03 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[CG_ApplyAccredit](
	[TaskNum] [varchar](50) NOT NULL,
	[ApplyOpter] [varchar](200) NOT NULL,
	[ApplyFlag] [varchar](2) NOT NULL,
	[ApplyDelayInfo] [varchar](50) NULL,
	[ApplyDate] [varchar](50) NOT NULL,
	[ApplyMemo] [varchar](500) NOT NULL,
	[ReplyDate] [varchar](50) NULL,
	[ReplyCode] [varchar](200) NULL,
	[ReplyInfo] [varchar](50) NULL,
	[ReplyMemo] [varchar](500) NULL
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO

