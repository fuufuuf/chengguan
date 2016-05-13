USE [BMSInspection]
GO

/****** Object:  Table [dbo].[CG_push]    Script Date: 2016/1/26 18:29:59 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[CG_push](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[title] [varchar](200) NULL,
	[create_time] [varchar](40) NULL,
	[contents] [varchar](500) NULL,
	[type] [varchar](10) NULL,
	[push_time] [varchar](40) NULL,
	[status] [varchar](10) NULL,
	[zhcg] [varchar](10) NULL,
	[rep_attach] [varchar](500) NULL,
	[push_group] [varchar](200) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO

