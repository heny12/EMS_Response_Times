# Statistical calculations for driving times in seattle
data <- read.csv(file="result.csv", header=TRUE, sep=",")
drive_times <- data$response_time

##PLOT OF DRIVE TIMES TO MEDIC DISPATCH CENTERS
  c<- c(0,0,0,0,0,0,0,0,0,0)
  d <- round(drive_times/100)
  for(i in d) {
    c[i] <- c[i]+1
  }
  names(c) <- c("100","200","300","400","500","600","700","800","900"
                 ,"1000")
  barplot(c, las=2, main="drive time frequency distribution for drive times
          from Seattle addresses to EMS response locations", xlab="drive 
          time (seconds)", ylab="frequency of sample addresses")

##BOXPLOT FOR DRIVE TIMES
  boxplot(drive_times,horizontal=TRUE,xlab="drive time (seconds)",main="boxplot 
        of drive times to EMS dispatch locations in Seattle") 

min(drive_times) # shortest drive time is 18 seconds
max(drive_times) # longest drive time is 980 seconds
mean <- mean(drive_times) # mean drive time from address to medic dispatch center
  # is 464.2 seconds (7.75 minutes)
median(drive_times) # 425 seconds
quantile(drive_times) 
# 0%   25%   50%   75%  100% 
# 18.0 327.5 452.0 588.0 980.0 
IQR(drive_times) # interquartile range is 260.5 seconds
stdv <- sd(drive_times) # standard deviation is 189.3626 seconds
skewness(drive_times) # 0.25, there is a slight positive skew to drive times
kurtosis(drive_times) # 2.62, indicates a leptokurtic (peaked) distribution


### ESTSiMATE RESPONSE TImeS BASED ON ACTUAL EMS DATA
rmean <- 8.1
rstdev <- 3
processing <- 2.4

data$calculatedResponse <- vector(mode="integer",length=length(data))
i <- 1
for(d in data$response_time){
  dif <- d-mean
  s <- dif/stdv
  k <- rmean+(rstdev*s)
  data$calculatedResponse[i] <- k*60
  i <- i+1
}

