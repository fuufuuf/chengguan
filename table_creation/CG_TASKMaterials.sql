USE [BMSInspection]
GO

/****** Object:  Table [dbo].[CG_TaskMaterials]    Script Date: 2016/1/26 18:32:50 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[CG_TaskMaterials](
	[TaskNum] [varchar](50) NOT NULL,
	[SourceName] [char](200) NULL,
	[SourceURL] [char](200) NULL,
	[LocalURL] [char](200) NULL,
	[Type] [char](20) NULL
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO

ALTER TABLE [dbo].[CG_TaskMaterials]  WITH CHECK ADD  CONSTRAINT [FK_CG_TaskMaterials_CG_taskdispatch] FOREIGN KEY([TaskNum])
REFERENCES [dbo].[CG_taskdispatch] ([TaskNum])
GO

ALTER TABLE [dbo].[CG_TaskMaterials] CHECK CONSTRAINT [FK_CG_TaskMaterials_CG_taskdispatch]
GO

