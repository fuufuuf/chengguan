USE [BMSInspection]
GO

/****** Object:  Table [dbo].[CG_taskdispatch]    Script Date: 2016/1/26 18:30:48 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[CG_taskdispatch](
	[TaskNum] [varchar](50) NOT NULL,
	[FindTime] [varchar](50) NOT NULL,
	[EventSource] [varchar](50) NULL,
	[EventType] [varchar](80) NOT NULL,
	[MainType] [varchar](80) NOT NULL,
	[SubType] [varchar](80) NOT NULL,
	[DistrictCode] [varchar](50) NOT NULL,
	[DistrictName] [varchar](80) NOT NULL,
	[StreetCode] [varchar](50) NOT NULL,
	[StreetName] [varchar](80) NOT NULL,
	[CommunityCode] [varchar](50) NOT NULL,
	[CommunityName] [varchar](80) NOT NULL,
	[CoordinateX] [float] NOT NULL,
	[CoordinateY] [float] NOT NULL,
	[EventAddress] [varchar](2000) NOT NULL,
	[EventDescription] [varchar](2000) NOT NULL,
	[EventPositionMap] [varchar](200) NULL,
	[SendTime] [varchar](50) NULL,
	[DealEndTime] [varchar](50) NOT NULL,
	[SendMemo] [varchar](500) NULL,
	[DealTimeLimit] [float] NOT NULL,
	[DealUnit] [varchar](200) NULL,
	[Status] [varchar](4) NULL,
	[SearchTag] [varchar](4) NULL,
 CONSTRAINT [PK_CG_taskdispatch] PRIMARY KEY CLUSTERED 
(
	[TaskNum] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO

