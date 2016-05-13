USE [BMSInspection]
GO

/****** Object:  Table [dbo].[CG_TaskFeedBack]    Script Date: 2016/1/26 18:32:06 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[CG_TaskFeedBack](
	[TaskNum] [varchar](20) NOT NULL,
	[FeedbackDate] [varchar](20) NOT NULL,
	[FeedbackMemo] [varchar](500) NOT NULL,
	[FeedbackOpter] [varchar](200) NOT NULL,
	[FeedbackPic] [varchar](500) NULL
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO

